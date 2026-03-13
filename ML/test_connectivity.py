from google import genai
import os

def test_models():
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
    models_to_test = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro", "gemini-1.0-pro", "gemini-2.0-flash", "gemini-2.0-pro"]
    
    for model_name in models_to_test:
        print(f"Testing {model_name}...")
        try:
            response = client.models.generate_content(
                model=model_name,
                contents=["Say 'Hi'"]
            )
            print(f"  SUCCESS: {response.text}")
        except Exception as e:
            msg = str(e)
            if "404" in msg:
                print(f"  FAILED: 404 NOT_FOUND")
            elif "429" in msg:
                print(f"  FAILED: 429 QUOTA_EXCEEDED")
            else:
                print(f"  FAILED: {msg[:100]}")

if __name__ == "__main__":
    test_models()
