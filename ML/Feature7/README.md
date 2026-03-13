# THINKMAP AI – MISCONCEPTION DETECTION ENGINE

This module analyzes student explanations and detects conceptual misconceptions in their reasoning using fine-tuned semantic analysis.

## 1. Datasets Used
- **Scitail** (via HuggingFace `datasets`): Exploited as a proxy to retrieve entailment mappings (contradictions map to `Factual Errors`, neutral maps to `Missing Info` vs. fully valid concepts).

## 2. Preprocessing Pipeline
- All input strings pass through `src/preprocessing.py` which trims whitespace occurrences, strictly lowercases inputs, and restricts regex to highly normalized ASCII boundaries.
- Uses `class balancing` via Pandas to prevent dataset bias.

## 3. Model Architecture
- Relies on Transformer sequences utilizing `sentence-transformers/all-MiniLM-L6-v2`. This model was chosen because it meets standard latency targets `< 300 ms` while being drastically smaller than the `< 500 MB` capacity budget.
- We map outputs to dense sequence classification layers (`AutoModelForSequenceClassification`).

## 4. Training Process
1. Initialize the dataset using the builder pattern: `python src/dataset_builder.py` 
2. Execute model training mapping with AdamW + Linear Warmup parameters: `python src/train.py`
3. Run model tracking with Early stopping parameter evaluation if F1 score maximizes.

## 5. Evaluation Results
Evaluate your trained parameters locally with standard F1/Precision measurements:
`python src/evaluate.py`

## 6. Calling the Inference Function (For Backend Developers)
You can directly import and call the standalone `detect_misconception` module:

```python
import sys
sys.path.append('path/to/feature_7')

from src.inference import detect_misconception

response = detect_misconception("Force keeps objects moving forward.")

print(response)
# Expected Output:
# {
#  "misconception_detected": True,
#  "misconception": "Direct Contradiction / Factual Error",
#  "concept": "Newton's First Law",
#  "confidence": 0.87,
#  "explanation": "The student's reasoning exhibits: Direct Contradiction / Factual Error"
# }
```

## Structure layout
* `data/` and `models/`: Persistent locations storing checkpoints.
* `config/model_config.yaml`: Used for dynamic batch sizing and layer tuning.
* No internal API routing exists; standard modularized ML logic.
