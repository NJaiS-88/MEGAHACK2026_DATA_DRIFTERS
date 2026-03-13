from ML.feature3_student_knowledge_tracking.database import questions_collection, concepts_collection
import sys

def seed():
    print("Seeding Atlas MongoDB with test data...")
    
    # clear existing if needed (optional)
    # questions_collection.delete_many({})
    
    sample_question = {
        "questionId": "0",
        "conceptId": "newtons_first_law",
        "questionText": "What happens to an object in motion if no external force acts on it?",
        "options": [
            "It stops immediately",
            "It continues in motion with the same velocity",
            "It slows down gradually",
            "It changes direction"
        ],
        "correctAnswer": "It continues in motion with the same velocity",
        "difficulty": "Easy"
    }
    
    # Upsert the sample question
    questions_collection.update_one(
        {"questionId": "0"},
        {"$set": sample_question},
        upsert=True
    )
    
    print("Successfully seeded sample question (ID: 0)")

if __name__ == "__main__":
    seed()
