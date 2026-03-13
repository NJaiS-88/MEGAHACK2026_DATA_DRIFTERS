from google import genai
import os
from ML.feature3_student_knowledge_tracking.config import settings

def list_gemini_models():
    api_key = settings.GEMINI_API_KEY
    if not api_key:
        print("Error: GEMINI_API_KEY not found in config.")
        return

    client = genai.Client(api_key=api_key)
    print(f"Using API Key: {api_key[:5]}...{api_key[-5:]}")
    
    try:
        print("\nAvailable models:")
        for model in client.models.list():
            print(f"- {model.name} (Supported: {model.supported_actions})")
    except Exception as e:
        print(f"Error listing models: {e}")

if __name__ == "__main__":
    list_gemini_models()
