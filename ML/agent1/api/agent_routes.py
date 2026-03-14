"""
Agent Routes
API endpoints for the Misconception Investigation Agent.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from agent.misconception_agent import agent
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1", tags=["agent"])


class InvestigationRequest(BaseModel):
    """Request model for misconception investigation."""
    student_explanation: str
    student_answer: Optional[str] = ""


class InvestigationResponse(BaseModel):
    """Response model for misconception investigation."""
    student_explanation: str
    misconception_detected: bool
    diagnostic_question: str
    student_answer: str
    root_cause: str
    message: str


@router.post("/investigate", response_model=InvestigationResponse)
async def investigate(request: InvestigationRequest):
    """
    Investigate a student misconception.
    
    Workflow:
    1. Run misconception detection
    2. If detected, ask diagnostic question
    3. Analyze student answer
    4. Identify root cause
    
    Args:
        request: Investigation request with student explanation and answer
        
    Returns:
        Investigation results with root cause analysis
    """
    try:
        logger.info(f"Starting investigation for explanation: {request.student_explanation[:50]}...")
        
        # Initialize state
        initial_state = {
            "student_explanation": request.student_explanation,
            "misconception_detected": False,
            "diagnostic_question": "",
            "student_answer": request.student_answer or "",
            "root_cause": ""
        }
        
        # Run the agent
        result = agent.invoke(initial_state)
        
        # Prepare response
        response = InvestigationResponse(
            student_explanation=result.get("student_explanation", ""),
            misconception_detected=result.get("misconception_detected", False),
            diagnostic_question=result.get("diagnostic_question", ""),
            student_answer=result.get("student_answer", ""),
            root_cause=result.get("root_cause", ""),
            message="Investigation completed successfully"
        )
        
        logger.info(f"Investigation complete. Misconception detected: {response.misconception_detected}")
        
        return response
        
    except Exception as e:
        logger.error(f"Error during investigation: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error during investigation: {str(e)}")


@router.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "Misconception Investigation Agent"}
