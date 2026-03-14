"""
Automated Tests for Guided Concept Exploration Engine
"""

import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Test health check endpoint."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_root_endpoint():
    """Test root endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
    assert "endpoints" in response.json()


def test_explore_topic():
    """Test explore-topic endpoint."""
    request_data = {
        "student_id": "123",
        "topic": "Rust Programming Language"
    }
    
    response = client.post("/api/v1/explore-topic", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify response structure
    assert "core_concepts" in data
    assert "prerequisites" in data
    assert "learning_path" in data
    assert "student_readiness" in data
    assert "message" in data
    
    # Verify concepts were extracted
    assert len(data["core_concepts"]) > 0
    
    # Verify learning path was generated
    assert len(data["learning_path"]) > 0
    
    # Verify prerequisites structure
    assert isinstance(data["prerequisites"], dict)


def test_explore_topic_different_student():
    """Test explore-topic with different student."""
    request_data = {
        "student_id": "456",
        "topic": "Python Programming"
    }
    
    response = client.post("/api/v1/explore-topic", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["core_concepts"]) > 0
    assert len(data["learning_path"]) > 0


def test_concept_explanation():
    """Test concept-explanation endpoint."""
    request_data = {
        "student_id": "123",
        "concept": "Ownership Model",
        "student_explanation": "Ownership means variable control over memory"
    }
    
    response = client.post("/api/v1/concept-explanation", json=request_data)
    
    assert response.status_code == 200
    data = response.json()
    
    # Verify response structure
    assert "misconception_detection" in data
    assert "reasoning_score" in data
    assert "concept_map_update" in data
    assert "message" in data
    
    # Verify misconception detection
    assert "has_misconception" in data["misconception_detection"]
    assert "feedback" in data["misconception_detection"]
    
    # Verify reasoning score
    assert "reasoning_score" in data["reasoning_score"]
    assert "reasoning_level" in data["reasoning_score"]
    
    # Verify concept map update
    assert "updated" in data["concept_map_update"]
    assert data["concept_map_update"]["updated"] is True


def test_explore_topic_invalid_request():
    """Test explore-topic with invalid request."""
    # Missing required fields
    response = client.post("/api/v1/explore-topic", json={})
    assert response.status_code == 422  # Validation error


def test_concept_explanation_invalid_request():
    """Test concept-explanation with invalid request."""
    # Missing required fields
    response = client.post("/api/v1/concept-explanation", json={})
    assert response.status_code == 422  # Validation error


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
