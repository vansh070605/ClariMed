import google.generativeai as genai
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.database.models import User, Report
from app.auth.router import get_current_user
from app.core.config import settings
from sqlalchemy import desc

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
    # Fetch user's latest report
    report = db.query(Report).filter(Report.user_id == current_user.id).order_by(desc(Report.created_at)).first()
    
    context = ""
    if report and report.patient_summary:
        context = f"The patient's latest report had these key findings: {report.patient_summary.get('key_findings', [])}"
    else:
        context = "The patient has no uploaded reports yet."

    prompt = f"""You are ClariMed's AI Health Assistant. 
You are speaking to a patient named {current_user.name}. 
Here is their clinical context: {context}

Patient asks: {request.message}

Please provide a helpful, empathetic, and medically accurate response based ONLY on their clinical context. Always include a disclaimer that you are an AI and they should consult their doctor. Keep it concise.
"""

    if not settings.gemini_api_key:
        return ChatResponse(reply=f"Mock AI: You asked '{request.message}'. Based on your data: {context}. Disclaimer: I am a mock AI, please consult a doctor.")

    try:
        genai.configure(api_key=settings.gemini_api_key)
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        return ChatResponse(reply=response.text)
    except Exception as e:
        return ChatResponse(reply=f"I'm sorry, I'm having trouble connecting to my intelligence core right now. (Error: {str(e)})")
