import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.inference import detect_misconception

def test():
    student_explanation = "The sun revolves around the Earth because we can see it moving across the sky."
    print("Testing ML Module with input:", student_explanation)
    print("-" * 50)
    
    result = detect_misconception(student_explanation)
    import json
    print(json.dumps(result, indent=4))

if __name__ == "__main__":
    test()
