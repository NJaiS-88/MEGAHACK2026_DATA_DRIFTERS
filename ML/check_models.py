"""Quick script to list available Gemini models for your API key."""
from google import genai
import os

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY environment variable not set.")
    print("Set it with: $env:GEMINI_API_KEY = 'YOUR_KEY'")
    exit(1)

client = genai.Client(api_key=api_key)

print("Available Gemini models:\n")
for m in client.models.list():
    # Check if model supports generate_content
    if hasattr(m, "supported_generation_methods") and "generateContent" in m.supported_generation_methods:
        model_name = m.name.replace("models/", "")
        print(f"  ✓ {model_name}")
        print(f"    Full name: {m.name}")
        if hasattr(m, "supported_generation_methods"):
            print(f"    Methods: {m.supported_generation_methods}\n")
