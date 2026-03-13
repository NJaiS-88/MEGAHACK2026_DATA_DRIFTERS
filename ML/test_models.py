import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

models_to_try = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-pro"
]

print("Starting connectivity tests...")
for model_name in models_to_try:
    print(f"Testing model: {model_name}...", end=" ", flush=True)
    try:
        resp = client.models.generate_content(
            model=model_name,
            contents="Say 'Success'"
        )
        print("SUCCESS!")
        break
    except Exception as e:
        print(f"FAILED: {e}")
else:
    print("All common models failed.")
