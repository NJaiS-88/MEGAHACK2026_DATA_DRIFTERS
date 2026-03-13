#!/usr/bin/env python
"""Test the new Gemini-based recommendation engine"""
import sys
import os
import json

# Add project root to path
current_dir = os.path.dirname(os.path.abspath(__file__))
feature8_root = os.path.dirname(current_dir)  # ML/Feature8
project_root = os.path.dirname(feature8_root)  # MegaHack6.0
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from ML.Feature8.src.gemini_recommendation_engine import recommend_learning_resources

print("Testing Gemini-based Recommendation Engine")
print("=" * 60)

# Test 1: With misconception
print("\nTest 1: Student with misconception")
result1 = recommend_learning_resources(
    concept="Newton's First Law",
    misconception="Force keeps objects moving",
    understanding_level="misconception",
    question_text="What keeps an object in motion?",
    student_answer="A force must be applied to keep it moving"
)
print(f"Generated {len(result1.get('recommendations', []))} recommendations")
for i, rec in enumerate(result1.get('recommendations', [])[:3], 1):
    print(f"  {i}. {rec.get('title')} ({rec.get('type')}) - {rec.get('difficulty')}")

# Test 2: Without misconception
print("\nTest 2: Student without misconception")
result2 = recommend_learning_resources(
    concept="Photosynthesis",
    misconception="No Misconception",
    understanding_level="basic",
    question_text="How do plants make food?",
    student_answer="Plants use sunlight to convert carbon dioxide and water into glucose"
)
print(f"Generated {len(result2.get('recommendations', []))} recommendations")
for i, rec in enumerate(result2.get('recommendations', [])[:3], 1):
    print(f"  {i}. {rec.get('title')} ({rec.get('type')}) - {rec.get('difficulty')}")

print("\n" + "=" * 60)
print("Testing complete!")
