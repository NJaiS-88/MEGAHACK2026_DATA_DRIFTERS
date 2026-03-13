import json
import os
from ..config import settings

# Try new google.genai first, fallback to old google.generativeai
try:
    from google import genai as google_genai
    USE_NEW_API = True
except ImportError:
    try:
        import google.generativeai as google_genai
        USE_NEW_API = False
    except ImportError:
        google_genai = None
        USE_NEW_API = None

# Initialize Gemini API
gemini_api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")

if not gemini_api_key:
    print("[GeminiService] WARNING: GEMINI_API_KEY not set. Gemini analysis will not work.")
    model = None
    client = None
else:
    try:
        if USE_NEW_API:
            # New API (google.genai) - use correct model name
            client = google_genai.Client(api_key=gemini_api_key)
            model = "gemini-2.0-flash-exp"  # Try latest, fallback to others
        elif USE_NEW_API is False:
            # Old API (google.generativeai)
            google_genai.configure(api_key=gemini_api_key)
            model = google_genai.GenerativeModel('gemini-1.5-flash')
            client = None
        else:
            model = None
            client = None
    except Exception as e:
        print(f"[GeminiService] Error initializing Gemini: {e}")
        model = None
        client = None

async def analyze_student_reasoning(question_text: str, correct_answer: str, selected_answer: str, explanation: str) -> dict:
    """
    Sends the student's explanation to Gemini to analyze for misconceptions.
    Returns a dictionary with 'misconception', 'confidence', and 'feedback'.
    """
    if not model or not gemini_api_key:
        # Fallback when Gemini is not available
        is_correct = (selected_answer == correct_answer) if correct_answer else False
        has_issues = any(word in explanation.lower() for word in ["don't know", "unsure", "maybe", "guess", "think"])
        
        return {
            "misconception": has_issues or not is_correct,
            "confidence": 0.6 if has_issues else 0.8,
            "feedback": f"{'Great job! ' if is_correct else 'Not quite right. '}Your answer was {'correct' if is_correct else 'incorrect'}. {'Keep up the excellent work!' if is_correct else 'Review the concept and try again. Understanding takes practice!'}"
        }
    
    prompt = f"""You are an educational AI assistant. Analyze the student's reasoning and provide feedback.

Question: {question_text}
Correct Answer: {correct_answer}
Student's Selected Answer: {selected_answer}
Student's Explanation: {explanation}

Analyze if the student has any misconceptions or reasoning errors. Provide constructive feedback.

Respond ONLY with a valid JSON object (no markdown, no code blocks) with these exact keys:
- "misconception": boolean (true if there are flaws/misconceptions, false if reasoning is sound)
- "confidence": number between 0 and 1 (how confident you are in your assessment)
- "feedback": string (helpful, encouraging feedback message for the student, 2-3 sentences)
"""
    
    try:
        if USE_NEW_API and client:
            # New API - try different model names
            model_names = ["gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"]
            text = None
            last_error = None
            
            for model_name in model_names:
                try:
                    response = client.models.generate_content(
                        model=model_name,
                        contents=prompt
                    )
                    text = response.text.strip()
                    break
                except Exception as e:
                    last_error = e
                    continue
            
            if not text:
                raise last_error or Exception("All model names failed")
        else:
            # Old API
            response = model.generate_content(prompt)
            text = response.text.strip()
        
        # Remove potential markdown code blocks
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        
        # Try to extract JSON from response
        text = text.strip()
        
        # Find JSON object in response
        start_idx = text.find('{')
        end_idx = text.rfind('}') + 1
        
        if start_idx >= 0 and end_idx > start_idx:
            json_text = text[start_idx:end_idx]
            result = json.loads(json_text)
        else:
            # If no JSON found, try parsing entire text
            result = json.loads(text)
            
        return {
            "misconception": bool(result.get("misconception", False)),
            "confidence": float(result.get("confidence", 0.8)),
            "feedback": str(result.get("feedback", "Thank you for your response. Keep learning!"))
        }
    except json.JSONDecodeError as e:
        print(f"[GeminiService] JSON decode error: {e}")
        print(f"[GeminiService] Response text: {text[:200]}...")
        # Fallback: analyze response text for keywords
        text_lower = text.lower()
        has_misconception = any(word in text_lower for word in ["incorrect", "wrong", "misconception", "error", "mistake"])
        return {
            "misconception": has_misconception,
            "confidence": 0.7,
            "feedback": text[:200] + "..." if len(text) > 200 else text
        }
    except Exception as e:
        print(f"[GeminiService] Error: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        # Intelligent fallback based on answer correctness
        is_correct = (selected_answer == correct_answer) if correct_answer else False
        return {
            "misconception": not is_correct,
            "confidence": 0.6,
            "feedback": f"{'Great job! ' if is_correct else 'Not quite. '}Your answer was {'correct' if is_correct else 'incorrect'}. {'Keep up the good work!' if is_correct else 'Review the concept and try again.'}"
        }
