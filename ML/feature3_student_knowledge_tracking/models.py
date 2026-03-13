from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

# MongoDB Document Pydantic Models
class ConceptModel(BaseModel):
    conceptId: str
    name: str
    subjectId: str
    description: str
    prerequisites: List[str] = []

class QuestionModel(BaseModel):
    questionId: str
    questionText: str
    conceptId: str
    subjectId: str
    options: List[str] = []
    correctAnswer: str

class StudentAttemptModel(BaseModel):
    userId: str
    questionId: str
    conceptId: str
    concept: str  # Concept name for easier querying
    selectedAnswer: str  # The full answer text
    selectedOptionNumber: Optional[int] = None  # Option number (1, 2, 3, 4, etc.)
    questionText: str  # Full question text
    options: List[str] = []  # All available options
    correctAnswer: str  # Correct answer text
    explanation: str  # Student's explanation
    isCorrect: bool
    # Feature outputs
    misconception: Optional[Dict] = None  # Feature7 output
    recommendations: Optional[List[Dict]] = None  # Feature8 output
    feedback: Optional[str] = None  # AI feedback
    state: Optional[str] = None  # Knowledge state (green/yellow/red)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StudentKnowledgeModel(BaseModel):
    userId: str
    conceptStates: Dict[str, str]  # Map of conceptId -> "green", "yellow", or "red"
