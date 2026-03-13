from pydantic import BaseModel
from typing import Optional

# API Request and Response Schemas
class SubmitAnswerRequest(BaseModel):
    userId: str
    questionId: str
    selectedAnswer: str
    explanation: str

class SubmitAnswerResponse(BaseModel):
    conceptId: str
    state: str
    feedback: str
