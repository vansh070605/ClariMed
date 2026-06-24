import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Float, BigInteger, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.database.base import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean(), default=True)
    is_verified = Column(Boolean(), default=False)
    last_login = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    preferences = relationship("UserPreferences", back_populates="user", uselist=False, cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    preferred_language = Column(String(50), default="en")
    dark_mode = Column(Boolean(), default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="preferences")

class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String(1024), nullable=False)
    file_hash = Column(String(64), nullable=True, index=True)
    file_size = Column(BigInteger, nullable=True)
    page_count = Column(Integer, nullable=True)
    status = Column(String(50), default="pending", nullable=False)
    raw_text = Column(Text, nullable=True)
    metadata_json = Column(JSONB, nullable=True)
    extracted_entities = Column(JSONB, nullable=True)
    patient_summary = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    user = relationship("User", back_populates="reports")
    measurements = relationship("ReportMeasurement", back_populates="report", cascade="all, delete-orphan")

class ReportMeasurement(Base):
    __tablename__ = "report_measurements"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    biomarker_name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=True)
    value = Column(Float, nullable=False)
    unit = Column(String(50), nullable=True)
    reference_low = Column(Float, nullable=True)
    reference_high = Column(Float, nullable=True)
    abnormal_flag = Column(Boolean(), nullable=True)
    status = Column(String(50), nullable=True)
    severity = Column(String(50), nullable=True)
    delta_percent = Column(Float, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    report = relationship("Report", back_populates="measurements")

class TrendSnapshot(Base):
    __tablename__ = "trend_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    generated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    trend_data = Column(JSONB, nullable=False)

    user = relationship("User")

class SharedLink(Base):
    __tablename__ = "shared_links"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=True, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user = relationship("User")
    report = relationship("Report")
