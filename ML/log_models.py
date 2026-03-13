import os
from google import genai
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

with open("ML/full_models_list.txt", "w") as f:
    f.write("Full Model List:\n")
    try:
        models = client.models.list()
        for m in models:
            f.write(f"- {m.name}\n")
        f.write("\nDone.\n")
    except Exception as e:
        f.write(f"Error: {e}\n")

print("Model list written to ML/full_models_list.txt")
