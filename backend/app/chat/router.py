from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.database.models import User, Report
from app.auth.router import get_current_user
from app.core.config import settings

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


@router.post("/", response_model=ChatResponse)
def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Build clinical context from latest report
    report = db.query(Report).filter(
        Report.user_id == current_user.id
    ).order_by(desc(Report.created_at)).first()

    if report and report.patient_summary:
        key_findings = report.patient_summary.get('key_findings', [])
        overall = report.patient_summary.get('overall_assessment', '')
        context = f"Overall assessment: {overall}. Key findings: {key_findings}"
    else:
        context = "The patient has no uploaded reports or AI summaries yet."

    prompt = f"""You are ClariMed's AI Health Assistant — a knowledgeable, empathetic medical AI.
You are speaking to a patient named {current_user.name}.
Their clinical context from uploaded lab reports: {context}

Patient asks: {request.message}

Instructions:
- Answer based ONLY on the provided clinical context. Do not invent data.
- Be helpful, warm, and clear (avoid jargon).
- End EVERY response with: "⚠️ Always consult your physician before making any health decisions."
- Keep the response concise (2–4 paragraphs max).
"""

    no_key = not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY == "[GCP_API_KEY]"

    if no_key:
        # Fallback response when no API key is configured
        return ChatResponse(
            reply=(
                f"Based on your clinical data, here is what I can tell you:\n\n"
                f"{context}\n\n"
                "For a more personalised analysis, the administrator needs to configure the Gemini API key.\n\n"
                "⚠️ Always consult your physician before making any health decisions."
            )
        )

    try:
        from google import genai
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        response = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return ChatResponse(reply=response.text)
    except Exception as e:
        return ChatResponse(
            reply=(
                f"I'm having trouble reaching my intelligence core right now (Error: {str(e)}). "
                "Please try again in a moment.\n\n"
                "⚠️ Always consult your physician before making any health decisions."
            )
        )
