from google import genai
import os

def list_all_models():
    # Find the key
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

    print(f"Testing with Key: {key[:5]}...")
    client = genai.Client(api_key=key)
    
    print("\n--- Model List ---")
    try:
        models = list(client.models.list())
        for m in models:
            clean_name = m.name.replace("models/", "")
            actions = m.supported_actions if hasattr(m, "supported_actions") else "Unknown"
            print(f"Name: {clean_name}")
            print(f"  Actions: {actions}")
            print(f"  Base Model: {getattr(m, 'base_model_id', 'N/A')}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    list_all_models()
