import re

def clean_text(text: str) -> str:
    """
    Cleans the input explanation text for model evaluation and training.
    """
    text = str(text).lower()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text
