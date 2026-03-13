from google import genai
import os

def test_specific_models():
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
    # We saw these in actual_models.txt
    models_to_test = ["gemini-3-flash-preview", "gemini-flash-latest", "gemini-pro-latest", "gemini-3-pro-preview"]
    
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
            print(f"  FAILED: {msg[:150]}")

if __name__ == "__main__":
    test_specific_models()
