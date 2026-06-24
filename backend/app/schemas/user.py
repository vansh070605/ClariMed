from pydantic import BaseModel, EmailStr, ConfigDict, Field
from uuid import UUID
from datetime import datetime

class UserBase(BaseModel):
    name: str
    email: EmailStr

class UserCreate(UserBase):
    # Maximum length is 72 bytes due to bcrypt limitation.
    # Passwords longer than 72 bytes will cause bcrypt.hashpw to raise a ValueError.
    password: str = Field(min_length=8, max_length=72)

class UserResponse(UserBase):
    id: UUID
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    name: str

class PasswordUpdate(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=72)
