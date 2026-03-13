# Training the Misconception Detection Model

## Why the Notice Appears

The notice "Misconception model directory not found" appears because **Feature7's model hasn't been trained yet**. This is **normal and expected**. The system automatically uses fallback heuristic logic when the model is missing.

## Is This a Problem?

**No!** The fallback logic works fine for development and testing. It uses simple pattern matching to detect common misconceptions.

## To Train the Model (Optional)

If you want to use the actual trained model instead of fallback logic:

### Step 1: Build the Dataset
```bash
cd ML/Feature7
python src/dataset_builder.py
```

### Step 2: Train the Model
```bash
python src/train.py
```

This will:
- Train a fine-tuned model based on `sentence-transformers/all-MiniLM-L6-v2`
- Save the model to `ML/Feature7/models/misconception_detector/`
- Take several minutes depending on your hardware

### Step 3: Verify
After training, restart the ML server. The notice should disappear and you'll see:
```
[Feature7] Loaded misconception detection model from ...
```

## Current Behavior

Right now, Feature7 uses **heuristic fallback logic** which:
- Detects misconceptions based on keyword patterns
- Works for common cases like "don't know", "unsure", "maybe"
- Provides reasonable results for development

The trained model would provide:
- More accurate misconception detection
- Better confidence scores
- More nuanced classification (5 types vs simple detection)

## Summary

- ✅ **Only Feature7** uses the misconception model
- ✅ **Fallback logic works fine** - no action needed
- ⚙️ **Model training is optional** - only needed for production accuracy
