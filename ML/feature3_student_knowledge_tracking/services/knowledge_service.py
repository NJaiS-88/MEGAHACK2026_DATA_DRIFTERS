from datetime import datetime
from fastapi import HTTPException
from typing import Optional, List, Dict
from ..database import questions_collection, concepts_collection, student_attempts_collection, student_knowledge_collection
from ..utils.state_rules import determine_concept_state
from .gemini_service import analyze_student_reasoning

async def process_student_answer(
    user_id: str, 
    question_id: str, 
    selected_answer: str, 
    explanation: str,
    concept: Optional[str] = None,
    selected_option_number: Optional[int] = None,
    question_text: Optional[str] = None,
    options: Optional[List[str]] = None,
    correct_answer: Optional[str] = None,
    misconception_result: Optional[Dict] = None,
    recommendations: Optional[List[Dict]] = None
) -> dict:
    """
    Process student answer with full integration of all features.
    Handles both existing questions in DB and new questions from frontend.
    """
    # 1. Try to fetch question from MongoDB, or create from request data
    question = questions_collection.find_one({"questionId": question_id})
    
    if question:
        # Question exists in DB
        concept_id = question.get("conceptId", concept or "unknown")
        correct_answer = question.get("correctAnswer") or correct_answer or ""
        question_text = question.get("questionText") or question_text or ""
        options = question.get("options", []) or options or []
    else:
        # Question doesn't exist - create it from request data
        concept_id = concept or "unknown"
        correct_answer = correct_answer or ""
        question_text = question_text or ""
        options = options or []
        
        # Create question document in DB
        question_doc = {
            "questionId": question_id,
            "questionText": question_text,
            "conceptId": concept_id,
            "concept": concept or "",
            "options": options,
            "correctAnswer": correct_answer,
            "subjectId": "general",  # Default subject
            "createdAt": datetime.utcnow()
        }
        questions_collection.insert_one(question_doc)
        print(f"[KnowledgeService] Created new question in DB: {question_id}")
    
    # 2. Ensure concept exists in concepts collection
    concept_doc = concepts_collection.find_one({"conceptId": concept_id})
    if not concept_doc and concept:
        concept_doc = {
            "conceptId": concept_id,
            "name": concept,
            "subjectId": "general",
            "description": f"Concept: {concept}",
            "prerequisites": []
        }
        concepts_collection.insert_one(concept_doc)
        print(f"[KnowledgeService] Created new concept in DB: {concept_id}")
    
    # 3. Check correctness of answer
    is_correct = (selected_answer == correct_answer) if correct_answer else False
    
    # 4. Send explanation to Gemini API for reasoning analysis (Feature 3)
    gemini_result = await analyze_student_reasoning(
        question_text=question_text,
        correct_answer=correct_answer,
        selected_answer=selected_answer,
        explanation=explanation
    )
    
    # Use misconception from Feature7 if provided, otherwise use Gemini result
    has_misconception = False
    if misconception_result:
        has_misconception = misconception_result.get("misconception_detected", False)
    else:
        has_misconception = gemini_result.get("misconception", False)
    
    feedback = gemini_result.get("feedback", "Thank you for your submission.")
    
    # 5. Determine concept state
    new_state = determine_concept_state(is_correct, has_misconception)
    
    # 6. Store comprehensive attempt in student_attempts collection
    attempt_doc = {
        "userId": user_id,
        "questionId": question_id,
        "conceptId": concept_id,
        "concept": concept or concept_id,
        "selectedAnswer": selected_answer,
        "selectedOptionNumber": selected_option_number,
        "questionText": question_text,
        "options": options,
        "correctAnswer": correct_answer,
        "explanation": explanation,
        "isCorrect": is_correct,
        # Feature outputs
        "misconception": misconception_result,
        "recommendations": recommendations,
        "feedback": feedback,
        "state": new_state,
        "timestamp": datetime.utcnow()
    }
    student_attempts_collection.insert_one(attempt_doc)
    print(f"[KnowledgeService] Stored attempt for user {user_id}, question {question_id}")
    
    # 7. Update student_knowledge collection
    student_knowledge_collection.update_one(
        {"userId": user_id},
        {"$set": {f"conceptStates.{concept_id}": new_state}},
        upsert=True
    )
    
    # 8. Return response
    return {
        "conceptId": concept_id,
        "state": new_state,
        "feedback": feedback
    }
