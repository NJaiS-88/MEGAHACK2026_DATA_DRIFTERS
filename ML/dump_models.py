from google import genai
import os

def dump_models():
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
    with open("c:/Users/Sejal Jain/OneDrive/Documents/Desktop/megahack2/MegaHack6.0/ML/actual_models.txt", "w") as f:
        try:
            for m in client.models.list():
                f.write(f"{m.name}\n")
            print("Dumped all model names to actual_models.txt")
        except Exception as e:
            f.write(f"Error: {e}\n")
            print(f"Error: {e}")

if __name__ == "__main__":
    dump_models()
