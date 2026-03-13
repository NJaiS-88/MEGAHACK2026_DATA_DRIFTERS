from google import genai
import os

def list_models():
    # Attempt to find the key in either .env
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
    
    if not key:
        print("No key found.")
        return

    print(f"Key: {key[:5]}...")
    client = genai.Client(api_key=key)
    try:
        for m in client.models.list():
            if "generateContent" in m.supported_actions:
                # Strip 'models/' prefix for the name we use in generate_content
                clean_name = m.name.replace("models/", "")
                print(f"- {clean_name}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_models()
