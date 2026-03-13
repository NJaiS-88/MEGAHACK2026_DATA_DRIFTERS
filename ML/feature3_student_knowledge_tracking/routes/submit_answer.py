from fastapi import APIRouter
from ..schemas import SubmitAnswerRequest, SubmitAnswerResponse
from ..services.knowledge_service import process_student_answer

router = APIRouter()

@router.post("/submit-answer", response_model=SubmitAnswerResponse)
async def submit_answer(request: SubmitAnswerRequest):
    """
    1. Receive request.
    2. Process student answer via knowledge service.
    3. Return concept state and AI feedback.
    """
    result = await process_student_answer(
        user_id=request.userId,
        question_id=request.questionId,
        selected_answer=request.selectedAnswer,
        explanation=request.explanation
    )
    return result
