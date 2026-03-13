import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

print("Listing models...")
try:
    models = client.models.list()
    print("Listing 1.5-flash variations:")
    for m in models:
        name = getattr(m, 'name', 'N/A')
        if "1.5-flash" in name.lower():
            print(f"MATCH: {name}")
except Exception as e:
    import traceback
    print(f"Error listing models: {e}")
    traceback.print_exc()
