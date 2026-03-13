from google import genai
import os

def list_models():
    key = None
    paths = ["c:/Users/Sejal Jain/OneDrive/Documents/Desktop/megahack2/MegaHack6.0/.env", 
             "c:/Users/Sejal Jain/OneDrive/Documents/Desktop/megahack2/.env"]
    for p in paths:
        if os.path.exists(p):
            with open(p, "r") as f:
                for line in f:
                    if "GEMINI_API_KEY=" in line:
                        key = line.split("=")[1].strip()
                        break
        if key: break
    if not key: return

    client = genai.Client(api_key=key)
    print("Listing models with 'flash' or 'pro' in name:")
    try:
        found = False
        for m in client.models.list():
            name = m.name.lower()
            if "flash" in name or "pro" in name:
                clean_name = m.name.replace("models/", "")
                print(f"- {clean_name}")
                found = True
        if not found:
            print("No flash/pro models found in the list.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_models()
