"""
Manual test script for Guided Concept Exploration Engine
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

def test_explore_topic():
    """Test explore-topic endpoint."""
    print("\nTesting explore-topic endpoint...")
    request_data = {
        "student_id": "123",
        "topic": "Rust Programming Language"
    }
    
    response = client.post("/api/v1/explore-topic", json=request_data)
    assert response.status_code == 200
    data = response.json()
    
    assert "core_concepts" in data
    assert "prerequisites" in data
    assert "learning_path" in data
    assert "student_readiness" in data
    
    print(f"[OK] Explore topic passed")
    print(f"  - Extracted {len(data['core_concepts'])} concepts")
    print(f"  - Generated learning path with {len(data['learning_path'])} concepts")
    print(f"  - Concepts: {data['core_concepts'][:3]}...")

def test_concept_explanation():
    """Test concept-explanation endpoint."""
    print("\nTesting concept-explanation endpoint...")
    request_data = {
        "student_id": "123",
        "concept": "Ownership Model",
        "student_explanation": "Ownership means variable control over memory"
    }
    
    response = client.post("/api/v1/concept-explanation", json=request_data)
    assert response.status_code == 200
    data = response.json()
    
    assert "misconception_detection" in data
    assert "reasoning_score" in data
    assert "concept_map_update" in data
    
    print(f"[OK] Concept explanation passed")
    print(f"  - Misconception detected: {data['misconception_detection']['has_misconception']}")
    print(f"  - Reasoning score: {data['reasoning_score']['reasoning_score']:.1f}")

if __name__ == "__main__":
    print("=" * 60)
    print("Guided Concept Exploration Engine - Manual Tests")
    print("=" * 60)
    
    try:
        test_health()
        test_root()
        test_explore_topic()
        test_concept_explanation()
        
        print("\n" + "=" * 60)
        print("[SUCCESS] ALL TESTS PASSED!")
        print("=" * 60)
        sys.exit(0)
    except Exception as e:
        print(f"\n[ERROR] TEST FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
