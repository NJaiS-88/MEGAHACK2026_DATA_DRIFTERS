## ThinkMap AI - Topic Hierarchy Extraction Module (Feature 1)

This module provides a **production-ready pipeline** for extracting hierarchical topics and subtopics from educational content using **Google Gemini** (via `google-genai`). It supports **text**, **documents** (DOCX, TXT), and **images** (PNG, JPG, JPEG).

### 1. Features

- **Input type detection**: automatically detects whether the input is raw text, a document, or an image.
- **Text extraction**:
  - DOCX via `python-docx`
  - TXT via standard file IO
  - Images via OCR (`pytesseract` or `easyocr`)
- **Text preprocessing**:
  - Unicode normalization
  - Whitespace cleanup
  - Heuristic removal of page numbers and headers/footers
  - Sentence splitting (spaCy, NLTK, or regex fallback)
  - Chunking for long inputs
- **Gemini integration**:
  - Uses `google-genai` SDK with `gemini-1.5-flash` model
  - Strict JSON prompt for topic hierarchy extraction
- **Hierarchy builder & JSON validation**:
  - Cleans markdown fences
  - Attempts minor JSON fixes (e.g., trailing commas)
  - Validates the nested structure
- **Production concerns**:
  - Configurable via environment variables
  - Logging utilities
  - Graceful error handling and retries

### 2. Project Structure

All files live under `ml/feature1/`:

- `input_processing/`
  - `text_input_handler.py`
  - `image_input_handler.py`
  - `document_input_handler.py`
- `extraction/`
  - `text_cleaner.py`
  - `topic_extractor.py`
  - `hierarchy_builder.py`
- `models/`
  - `gemini_client.py`
- `pipeline/`
  - `topic_pipeline.py`
- `utils/`
  - `json_validator.py`
  - `logger.py`
- `config/`
  - `config.py`
- `tests/`
  - `test_pipeline.py`
- `main.py`
- `requirements.txt`
- `frontend_app.py` (Streamlit-based test UI)

### 3. Installation

From the project root:

```bash
pip install -r ml/feature1/requirements.txt
```

> Note: Some dependencies (e.g. spaCy models, NLTK data, EasyOCR models, Tesseract binary) may require additional installation steps depending on your environment.

### 4. Environment Configuration

Set the following environment variables (or use a `.env` file at the project root):

- **Required**
  - `GEMINI_API_KEY`: your Google Gemini API key.
- **Optional**
  - `GEMINI_MODEL`: default `gemini-1.5-pro` (e.g. `gemini-1.5-flash`).
  - `OCR_ENGINE`: `pytesseract` or `easyocr` (default: `pytesseract`).
  - `EASYOCR_LANGS`: comma-separated languages for EasyOCR (default: `en`).
  - `MAX_CHARS_PER_CHUNK`: maximum characters per text chunk (default: `8000`).
  - `GEMINI_MAX_RETRIES`: Gemini API retries per call (default: `1`).

### 5. Usage

#### 5.1. Programmatic API

Use the main pipeline function `generate_topic_hierarchy`:

```python
from ml.feature1.pipeline.topic_pipeline import generate_topic_hierarchy

# Example 1: Raw text
hierarchy = generate_topic_hierarchy("Explain Newton's laws of motion and their applications.")

# Example 2: Document path
hierarchy = generate_topic_hierarchy("path/to/chapter.docx")

# Example 3: Image path
hierarchy = generate_topic_hierarchy("path/to/notes.png")

print(hierarchy)
```

Returned value is a **Python dictionary** matching the nested JSON structure, e.g.:

```python
{
  "Laws of Motion": {
    "Newton's First Law": [
      "Inertia",
      "Examples of Inertia"
    ],
    "Newton's Second Law": [
      "Force Equation",
      "Mass and Acceleration Relationship"
    ],
    "Newton's Third Law": [
      "Action Reaction Forces"
    ]
  }
}
```

#### 5.2. CLI Usage

From the project root:

```bash
python -m ml.feature1.main "Explain Newton's laws of motion and their applications."
```

Or with a file:

```bash
python -m ml.feature1.main path/to/chapter.docx
python -m ml.feature1.main path/to/notes.png
```

The CLI prints the resulting JSON to stdout.

#### 5.3. Streamlit Frontend (for quick manual testing)

Start the Streamlit app from the project root:

```bash
streamlit run ml/feature1/frontend_app.py
```

The UI lets you:

- Enter **text/topic names** in a textbox.
- Upload **DOCX/TXT** documents or **images (PNG/JPG/JPEG)**.
- View the resulting nested JSON hierarchy in the browser.

### 6. Tests

Tests use `pytest` and **monkeypatch** the Gemini-dependent component to avoid external calls:

```bash
pytest ml/feature1/tests
```

### 7. Error Handling Notes

- **Empty text**: raises `ValueError` before any external calls.
- **OCR failures**: surface as exceptions with informative logging.
- **Invalid documents**: unsupported extensions or unreadable files raise `ValueError`/IO errors.
- **Gemini API errors**: retried according to `GEMINI_MAX_RETRIES`; failures raise after all attempts.
- **JSON validation errors**: one automatic retry of the Gemini call; if still invalid, an exception is raised.

