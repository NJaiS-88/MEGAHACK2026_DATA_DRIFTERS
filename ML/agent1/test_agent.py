"""
Test script for Misconception Investigation Agent
"""

import sys
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_health():
    """Test health check endpoint."""
    print("Testing health check...")
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    print(f"[OK] Health check passed: {response.json()}")

def test_root():
    """Test root endpoint."""
    print("\nTesting root endpoint...")
    response = client.get("/")
    assert response.status_code == 200
    print(f"[OK] Root endpoint passed")

def test_investigate_with_misconception():
    """Test investigate endpoint with misconception."""
    print("\nTesting investigate endpoint (with misconception)...")
    request_data = {
        "student_explanation": "Force keeps objects moving",
        "student_answer": "It will stop"
    }
    
    response = client.post("/api/v1/investigate", json=request_data)
    assert response.status_code == 200
    data = response.json()
    
    assert "misconception_detected" in data
    assert "diagnostic_question" in data
    assert "root_cause" in data
    
    print(f"[OK] Investigate endpoint passed")
    print(f"  - Misconception detected: {data['misconception_detected']}")
    print(f"  - Diagnostic question: {data['diagnostic_question'][:60]}...")
    print(f"  - Root cause: {data['root_cause'][:80]}...")

def test_investigate_without_misconception():
    """Test investigate endpoint without misconception."""
    print("\nTesting investigate endpoint (without misconception)...")
    request_data = {
        "student_explanation": "Objects in motion stay in motion unless acted upon by a force",
        "student_answer": ""
    }
    
    response = client.post("/api/v1/investigate", json=request_data)
    assert response.status_code == 200
    data = response.json()
    
    assert "misconception_detected" in data
    print(f"[OK] Investigate endpoint passed (no misconception)")
    print(f"  - Misconception detected: {data['misconception_detected']}")

def test_agent_workflow():
    """Test complete agent workflow."""
    print("\nTesting complete agent workflow...")
    
    # Step 1: Initial investigation
    request_data = {
        "student_explanation": "Force keeps objects moving",
        "student_answer": ""
    }
    
    response = client.post("/api/v1/investigate", json=request_data)
    assert response.status_code == 200
    data = response.json()
    
    assert data["misconception_detected"] == True
    assert len(data["diagnostic_question"]) > 0
    
    print(f"  Step 1: Misconception detected - {data['misconception_detected']}")
    print(f"  Step 2: Question asked - {data['diagnostic_question'][:50]}...")
    
    # Step 2: Provide answer
    request_data["student_answer"] = "It will stop"
    response = client.post("/api/v1/investigate", json=request_data)
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["root_cause"]) > 0
    print(f"  Step 3: Root cause identified - {data['root_cause'][:60]}...")
    print(f"[OK] Complete workflow test passed")

if __name__ == "__main__":
    print("=" * 60)
    print("Misconception Investigation Agent - Tests")
    print("=" * 60)
    
    try:
        test_health()
        test_root()
        test_investigate_with_misconception()
        test_investigate_without_misconception()
        test_agent_workflow()
        
        print("\n" + "=" * 60)
        print("[SUCCESS] ALL TESTS PASSED!")
        print("=" * 60)
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
