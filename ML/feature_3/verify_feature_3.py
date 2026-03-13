import sys
import os

# Add src to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from src.evaluation_service import get_question, submit_answer, get_concept_status

def test_system():
    print("Testing Question Serving...")
    # Using a known concept from config/concepts.yaml
    q = get_question("Force")
    if "error" in q:
        print(f"Error: {q['error']}")
        return
        
    print(f"Retrieved Question: {q['question']}")
    print(f"Concept: {q['concept']}")
    
    student_id = "test_user_123"
    question_id = q["id"]
    
    print("\nSubmitting Correct Answer...")
    # Use the actual correct answer from the question object
    ans = q.get("correct_answer", "force")
    result = submit_answer(student_id, question_id, ans)
    print(f"Result: {result}")
    
    print("\nSubmitting Wrong Answer...")
    result = submit_answer(student_id, question_id, "This is definitely wrong")
    print(f"Result: {result}")
    
    print("\nChecking Concept Status...")
    status = get_concept_status(student_id, q["concept"])
    print(f"Status: {status}")

if __name__ == "__main__":
    test_system()
