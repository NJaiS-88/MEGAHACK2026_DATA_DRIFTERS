import os
import tempfile
from pathlib import Path

import streamlit as st

from pipeline.topic_pipeline import generate_topic_hierarchy
from utils.logger import setup_logger


setup_logger()

st.set_page_config(page_title="ThinkMap Topic Hierarchy Extractor", layout="wide")
st.title("ThinkMap AI – Topic Hierarchy Extractor")
st.write(
    "Enter educational text or a topic/subject name to generate a hierarchical topic "
    "structure using Google Gemini."
)


with st.sidebar:
    st.header("Configuration")
    st.markdown(
        "- Gemini API key is read from environment variable `GEMINI_API_KEY`.\n"
        "- Optional: `GEMINI_MODEL`, `OCR_ENGINE`, `EASYOCR_LANGS`."
    )
    st.write("Current GEMINI_MODEL:", os.getenv("GEMINI_MODEL", "gemini-1.5-pro"))


tab_text = st.tabs(["Text / Topic Name"])[0]

with tab_text:
    text_input = st.text_area(
        "Enter subject/chapter description, topic name, or educational text",
        height=200,
        placeholder="e.g., Explain Newton's laws of motion and their applications.",
    )
    if st.button("Generate Topics from Text", type="primary", use_container_width=True):
        if not text_input.strip():
            st.error("Please enter some text.")
        else:
            with st.spinner("Generating topic hierarchy with Gemini..."):
                try:
                    hierarchy = generate_topic_hierarchy(text_input)
                    st.success("Topic hierarchy generated.")
                    st.json(hierarchy)
                except Exception as exc:
                    st.error(f"Error generating topics: {exc}")

