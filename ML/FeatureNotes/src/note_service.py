import google.generativeai as genai
import os
import time
from typing import Dict, List, Any
from ML.feature3_student_knowledge_tracking.config import settings

class NoteService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        if not self.api_key:
            # Fallback to direct env if settings fails
            self.api_key = os.getenv("GEMINI_API_KEY", "")
        
        if self.api_key:
            genai.configure(api_key=self.api_key)
            # Standard stable model for this project
            self.model_name = 'gemini-1.5-flash'
        else:
            print("[NoteService] WARNING: No GEMINI_API_KEY found.")
            self.model_name = None

    async def generate_note_paragraph(self, concept: str) -> str:
        """
        Generates a professional, educational paragraph for a specific concept.
        Uses a robust fallback list of models confirmed to work in other features.
        """
        if not self.model_name:
            return f"Note generation unavailable for {concept} (API Key missing)."

        prompt = f"""
        You are an expert academic tutor. 
        Write a concise, educational, and engaging 1-paragraph explanation of the concept: "{concept}".
        Focus on clarity and depth. Do not use markdown headers or bold text, just return the plain text paragraph.
        Return ONLY the paragraph text.
        """
        
        # Robust fallback list based on working models in other features
        # Removed 'gemini-pro' as it causes 404 in some regions/versions.
        models_to_try = [
            'gemini-1.5-flash', 
            'gemini-1.5-flash-latest',
            'gemini-2.0-flash', 
            'gemini-flash-latest'
        ]
        
        last_err = None
        for model_id in models_to_try:
            try:
                print(f"[NoteService] Attempting generation for '{concept}' with model: {model_id}")
                model = genai.GenerativeModel(model_id)
                response = model.generate_content(prompt)
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                last_err = e
                print(f"[NoteService] Model {model_id} failed for {concept}: {e}")
                continue
        
        return f"Note generation failed for {concept}. Please check your Gemini API quota or model availability. (Last Error: {str(last_err)[:50]})"

    async def get_notes_for_book(self, user_id: str, hierarchy: Dict[str, Any], concept_states: Dict[str, str]) -> List[Dict[str, Any]]:
        """
        Generates notes for all attempted concepts in a book.
        A concept is considered "attempted" if it has a state in concept_states.
        """
        all_notes = []
        
        # Flatten hierarchy to get all concepts and their parent subtopics
        for main_topic, subtopics in hierarchy.items():
            for subtopic, concepts in subtopics.items():
                # Check if subtopic itself was attempted
                if subtopic in concept_states:
                    paragraph = await self.generate_note_paragraph(subtopic)
                    state = concept_states.get(subtopic)
                    all_notes.append({
                        "header": subtopic,
                        "content": paragraph,
                        "highlight": state != "green",
                        "type": "subtopic"
                    })
                
                # Check each concept
                for concept in concepts:
                    if concept in concept_states:
                        paragraph = await self.generate_note_paragraph(concept)
                        state = concept_states.get(concept)
                        all_notes.append({
                            "header": concept,
                            "content": paragraph,
                            "highlight": state != "green",
                            "type": "concept"
                        })
        
        return all_notes

# Singleton instance
note_service = NoteService()
