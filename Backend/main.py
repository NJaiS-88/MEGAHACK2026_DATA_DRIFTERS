from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Add feature_3 to path to allow imports from ML/feature_3/src
# Path: c:\Users\Sejal Jain\OneDrive\Documents\Desktop\megahack6.0\MegaHack6.0\ML\feature_3
feature_3_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "ML", "feature_3"))
sys.path.append(feature_3_path)

from src.evaluation_service import get_question as get_q_svc, submit_answer as submit_a_svc, get_concept_status as get_status_svc

app = FastAPI(title="ThinkMap AI — Concept Based Question System API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnswerSubmission(BaseModel):
    student_id: str = "default_student" # In a real app, this would come from auth
    question_id: int
    answer: str

@app.get("/question/{concept}")
async def get_question(concept: str):
    try:
        q = get_q_svc(concept)
        if "error" in q:
            raise HTTPException(status_code=404, detail=q["error"])
        return q
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/submit-answer")
async def submit_answer(submission: AnswerSubmission):
    try:
        result = submit_a_svc(submission.student_id, submission.question_id, submission.answer)
        if "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        
        # Mapping response to match frontend expectation
        return {
            "correct": result["correct"],
            "concept": result["concept"],
            "status": result["status_update"]["status"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status/{student_id}/{concept}")
async def get_concept_status(student_id: str, concept: str):
    try:
        status = get_status_svc(student_id, concept)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
