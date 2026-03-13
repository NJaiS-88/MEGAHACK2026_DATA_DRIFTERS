import random
import os
import json
from ML.feature_3.src.gemini_client import GeminiQuizClient

class QuestionService:
    def __init__(self, data_path=None):
        self.gemini_client = GeminiQuizClient()
        if data_path is None:
            # Default to data/questions.json relative to feature_3 root
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.data_path = os.path.join(base_dir, "data", "questions.json")
        else:
            self.data_path = data_path
        self.questions = []
        self.load_questions()

    def load_questions(self):
        if os.path.exists(self.data_path):
            with open(self.data_path, 'r') as f:
                self.questions = json.load(f)
        else:
            print(f"Warning: {self.data_path} not found. System may need to run dataset_builder.py")

    def get_question(self, concept):
        # Filter questions by concept
        concept_qs = [q for q in self.questions if q["concept"].lower() == concept.lower()]
        
        if not concept_qs:
            # If no questions for specific concept, return a random one or handle accordingly
            if not self.questions:
                return {"error": "No questions available"}
            return random.choice(self.questions)
            
        return random.choice(concept_qs)

    def get_question_by_id(self, question_id):
        for q in self.questions:
            if q["id"] == question_id:
                return q
        return None

    def ai_generate_questions(self, concept: str):
        print(f"\n[QuestionService] --- AI Question Generation Started ---")
        print(f"[QuestionService] Concept: {concept}")
        
        try:
            raw_response = self.gemini_client.generate_questions(concept)
            print(f"[QuestionService] Gemini Response received (length: {len(raw_response)})")
        except Exception as e:
            print(f"[QuestionService] Gemini Client Error: {e}")
            raise e

        try:
            # The client skips backticks, so we can try direct load
            data = json.loads(raw_response)
            qs = data.get("questions", [])
            print(f"[QuestionService] Successfully parsed {len(qs)} questions.")
            return qs
        except json.JSONDecodeError:
            print(f"[QuestionService] Direct JSON parse failed, trying regex fallback...")
            import re
            match = re.search(r'\{.*\}', raw_response, re.DOTALL)
            if match:
                try:
                    data = json.loads(match.group())
                    qs = data.get("questions", [])
                    print(f"[QuestionService] Successfully parsed {len(qs)} questions with regex fallback.")
                    return qs
                except Exception as e:
                    print(f"[QuestionService] Regex fallback also failed: {e}")
            
            print(f"[QuestionService] CRITICAL: Could not parse Gemini response as JSON.")
            print(f"[QuestionService] Raw Response snippet: {raw_response[:200]}...")
            raise RuntimeError(f"Failed to parse AI response as valid JSON.")
