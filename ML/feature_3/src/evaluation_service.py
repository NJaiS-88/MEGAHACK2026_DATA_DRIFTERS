from src.question_service import QuestionService
from src.student_state import StudentState

class EvaluationService:
    def __init__(self):
        self.question_service = QuestionService()
        self.student_state = StudentState()

    def evaluate_answer(self, student_id, question_id, student_answer):
        question = self.question_service.get_question_by_id(question_id)
        if not question:
            return {"error": "Question not found"}
        
        is_correct = str(student_answer).strip().lower() == str(question["correct_answer"]).strip().lower()
        
        # Update state
        status_update = self.student_state.update_state(student_id, question["concept"], is_correct)
        
        return {
            "correct": is_correct,
            "concept": question["concept"],
            "correct_answer": question["correct_answer"],
            "status_update": status_update
        }

# For integration contract compliance
def get_question(concept):
    svc = QuestionService()
    return svc.get_question(concept)

def submit_answer(student_id, question_id, answer):
    svc = EvaluationService()
    return svc.evaluate_answer(student_id, question_id, answer)

def get_concept_status(student_id, concept):
    state = StudentState()
    return state.get_concept_status(student_id, concept)
