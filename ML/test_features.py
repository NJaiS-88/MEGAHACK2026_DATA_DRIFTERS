#!/usr/bin/env python
"""Test all three features"""
import sys
import os

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(current_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

print("Testing Feature Integration...")
print("=" * 50)

# Test Feature7
print("\n1. Testing Feature7 (Misconception Detection)...")
from ML.Feature7.src.inference import detect_misconception
result7 = detect_misconception("I don't know, maybe it needs force to move")
print(f"   Misconception detected: {result7.get('misconception_detected')}")
print(f"   Type: {result7.get('misconception')}")

# Test Feature8
print("\n2. Testing Feature8 (Recommendations)...")
from ML.Feature8.src.recommendation_engine import recommend_learning_resources
result8 = recommend_learning_resources(
    concept="Photosynthesis",
    misconception="Plants get food from soil",
    understanding_level="misconception"
)
print(f"   Recommendations count: {len(result8.get('recommendations', []))}")
if result8.get('recommendations'):
    print(f"   First recommendation: {result8['recommendations'][0].get('title')}")

# Test Feature3 Gemini Service (if API key available)
print("\n3. Testing Feature3 (Gemini Service)...")
import asyncio
from ML.feature3_student_knowledge_tracking.services.gemini_service import analyze_student_reasoning

async def test_gemini():
    result3 = await analyze_student_reasoning(
        question_text="What is photosynthesis?",
        correct_answer="Process by which plants make food using sunlight",
        selected_answer="Plants get food from soil",
        explanation="Plants absorb nutrients from the ground"
    )
    print(f"   Misconception: {result3.get('misconception')}")
    print(f"   Feedback: {result3.get('feedback')[:80]}...")

asyncio.run(test_gemini())

print("\n" + "=" * 50)
print("All features tested successfully!")
