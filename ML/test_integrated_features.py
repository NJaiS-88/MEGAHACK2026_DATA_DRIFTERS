import requests
import json
import sys
import os

def test_integration():
    url = "http://localhost:8010/api/submit-answer"
    payload = {
        "userId": "test_student_123",
        "questionId": "0",
        "concept": "Newton's First Law",
        "selectedAnswer": "Objects stay in motion.",
        "explanation": "I think force is needed to keep things moving because they stop eventually."
    }
    
    print(f"Sending request to {url}...")
    try:
        resp = requests.post(url, json=payload)
        if resp.status_code == 200:
            print("Response Status: 200 OK")
            print("Response Body:")
            print(json.dumps(resp.json(), indent=4))
        else:
            print(f"Error: Status Code {resp.status_code}")
            print(resp.text)
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    test_integration()
