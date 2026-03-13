# THINKMAP AI - Feature 8: Smart Learning Recommendation Engine

This module automatically recommends relevant learning resources to students based on the misconceptions detected in Feature 7.

## Integration with Feature 7

Feature 8 is designed to accept output from Feature 7 natively.
Feature 7 produces:
```json
{
 "concept": "Newton's First Law",
 "misconception": "Force keeps objects moving",
 "confidence": 0.87,
 "understanding_level": "misconception"
}
```

Feature 8 can use the `recommend_learning_resources()` method in `src/recommendation_engine.py`:
```python
from feature_8.src.recommendation_engine import recommend_learning_resources

output = recommend_learning_resources(
    concept=feature7_output['concept'],
    misconception=feature7_output['misconception'],
    understanding_level=feature7_output['understanding_level']
)
```

## Running the End-to-End Pipeline

To initialize the internal semantic retrieval model, run the following scripts in order:

1. Install requirements
```bash
pip install -r requirements.txt
```

2. Collect the HuggingFace datasets (`sciq`)
```bash
python src/data_collection.py
```

3. Build structured datasets
```bash
python src/dataset_builder.py
```

4. Preprocess data
```bash
python src/preprocessing.py
```

5. Build Resource Embeddings
```bash
python src/embedding_builder.py
```

6. Train FAISS Recommendation Model
```bash
python src/train.py
```

7. Evaluate / Inference test
```bash
python src/evaluate.py
python src/recommendation_engine.py
```

## Core Technologies
- `sentence-transformers` for robust embedding of student contexts.
- `faiss` vector database for <300ms similarity-based recommendations.
- HuggingFace datasets containing real, valid Science explanations and examples.
