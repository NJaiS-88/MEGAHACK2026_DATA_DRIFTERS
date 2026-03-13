import google.generativeai as genai
import os
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from ML.feature3_student_knowledge_tracking.config import settings

def test_gemini():
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        print("Error: GEMINI_API_KEY not found in settings.")
        return

    genai.configure(api_key=api_key)
    
    # Try gemini-1.5-flash
    model_id = 'gemini-1.5-flash'
    print(f"Testing model: {model_id}...")
    try:
        model = genai.GenerativeModel(model_id)
        response = model.generate_content("Say hello in one word.")
        print(f"Success! Response: {response.text}")
    except Exception as e:
        print(f"Error with {model_id}: {e}")

if __name__ == "__main__":
    test_gemini()
