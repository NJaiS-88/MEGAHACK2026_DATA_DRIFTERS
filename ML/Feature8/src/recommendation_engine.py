import os
import yaml
import faiss
import pandas as pd
from sentence_transformers import SentenceTransformer
import numpy as np

class RecommendationEngine:
    def __init__(self, config_path="config/model_config.yaml"):
        # Make config relative to Feature8 directory (not project root)
        current_dir = os.path.dirname(os.path.abspath(__file__))
        feature8_root = os.path.dirname(current_dir)  # ML/Feature8
        full_config_path = os.path.join(feature8_root, config_path)
        
        print(f"[Feature8] Loading config from: {full_config_path}")
        
        try:
            with open(full_config_path, "r") as f:
                self.config = yaml.safe_load(f)
        except Exception as e:
            print(f"[Feature8] Error loading config: {e}")
            self.config = {
                'paths': {
                    'faiss_index': 'models/recommendation_model/faiss.index',
                    'resource_df': 'models/recommendation_model/resources.pkl'
                },
                'model': {
                    'sentence_transformer': 'sentence-transformers/all-MiniLM-L6-v2',
                    'top_k': 5
                }
            }
            
        # Resolve paths relative to Feature8 root
        for key, path in self.config['paths'].items():
            if not os.path.isabs(path):
                self.config['paths'][key] = os.path.join(feature8_root, path)
                
        self.idx_path = self.config["paths"]["faiss_index"]
        self.df_path = self.config["paths"]["resource_df"]
        
        print(f"[Feature8] FAISS index path: {self.idx_path}")
        print(f"[Feature8] Resources DF path: {self.df_path}")
        print(f"[Feature8] Index exists: {os.path.exists(self.idx_path)}")
        print(f"[Feature8] DF exists: {os.path.exists(self.df_path)}")
        
        self.index = None
        self.df = None
        self.model = None
        self._models_loaded = False

    def _load_models(self):
        if self._models_loaded:
            return
            
        try:
            if not os.path.exists(self.idx_path):
                print(f"[Feature8] Notice: Missing FAISS index at {self.idx_path}. Using fallback recommendations.")
                self._models_loaded = True
                return
                
            if not os.path.exists(self.df_path):
                print(f"[Feature8] Notice: Missing resources DF at {self.df_path}. Using fallback recommendations.")
                self._models_loaded = True
                return
            
            print(f"[Feature8] Loading FAISS index and resources...")
            self.index = faiss.read_index(self.idx_path)
            self.df = pd.read_pickle(self.df_path)
            self.model = SentenceTransformer(self.config['model']['sentence_transformer'])
            self._models_loaded = True
            print(f"[Feature8] Successfully loaded models. Index size: {self.index.ntotal}, Resources: {len(self.df)}")
        except Exception as e:
            print(f"[Feature8] Warning: Failed to load Recommendation models. Error: {e}")
            import traceback
            traceback.print_exc()
            self._models_loaded = True

    def recommend(self, concept, misconception, understanding_level):
        self._load_models()
        
        if self.index is None or self.model is None or self.df is None:
            # Enhanced fallback recommendations if models are missing
            # Generate more diverse and concept-specific recommendations
            misconception_text = misconception if misconception and misconception != "No Misconception" else ""
            
            recommendations = []
            
            # Add concept-specific intro
            recommendations.append({
                "title": f"Introduction to {concept}",
                "type": "Video",
                "difficulty": "Beginner",
                "content_preview": f"Learn the fundamentals of {concept} with clear explanations and examples. Perfect for building a strong foundation.",
                "relevance_score": 0.9
            })
            
            # Add misconception-specific resource if applicable
            if misconception_text and misconception_text != "No Misconception":
                recommendations.append({
                    "title": f"Understanding {concept}: Common Misconceptions",
                    "type": "Article",
                    "difficulty": "Intermediate",
                    "content_preview": f"Explore common misunderstandings about {concept}, including why '{misconception_text}' is incorrect and what the correct understanding should be.",
                    "relevance_score": 0.85
                })
            
            # Add practice resource
            recommendations.append({
                "title": f"Practice Problems: {concept}",
                "type": "Practice",
                "difficulty": understanding_level.capitalize(),
                "content_preview": f"Test your understanding of {concept} with carefully designed practice problems and detailed solutions.",
                "relevance_score": 0.8
            })
            
            # Add advanced resource if not struggling
            if understanding_level != "misconception":
                recommendations.append({
                    "title": f"Advanced Topics in {concept}",
                    "type": "Article",
                    "difficulty": "Advanced",
                    "content_preview": f"Dive deeper into {concept} with advanced applications and real-world examples.",
                    "relevance_score": 0.75
                })
            
            return {
                "concept": concept,
                "misconception": misconception,
                "understanding_level": understanding_level,
                "recommendations": recommendations
            }
        
        # Build semantic query from input - make it more specific
        if misconception and misconception != "No Misconception":
            query = f"Learning resources for concept '{concept}'. Student has misconception: '{misconception}'. Need explanations to correct this misunderstanding. Understanding level: {understanding_level}."
        else:
            query = f"Learning resources for concept '{concept}'. Student understanding level: {understanding_level}. Provide educational content and explanations."
        
        try:
            # Perform embedding
            q_emb = self.model.encode([query], convert_to_numpy=True, show_progress_bar=False)
            faiss.normalize_L2(q_emb)
            
            k = min(self.config['model'].get('top_k', 5), self.index.ntotal)
            distances, indices = self.index.search(q_emb, k)
            
            recs = []
            for j, rank in enumerate(indices[0]):
                if rank >= len(self.df):
                    continue
                    
                score = 1.0 - distances[0][j]  # Convert distance to similarity score
                res = self.df.iloc[rank]
                
                # Handle different column names
                title = res.get('title', f"Resource {rank+1}")
                resource_type = res.get('resource_type', res.get('type', 'Article'))
                difficulty = res.get('difficulty_level', res.get('difficulty', 'Intermediate'))
                content = res.get('content', res.get('text', ''))
                
                rec = {
                    "title": str(title),
                    "type": str(resource_type),
                    "difficulty": str(difficulty),
                    "content_preview": (content[:150] + "...") if len(str(content)) > 150 else str(content),
                    "relevance_score": round(float(score), 4)
                }
                recs.append(rec)
            
            # If we got good results, return them
            if recs:
                return {
                    "concept": concept,
                    "misconception": misconception,
                    "understanding_level": understanding_level,
                    "recommendations": recs
                }
        except Exception as e:
            print(f"[Feature8] Error during recommendation search: {e}")
            import traceback
            traceback.print_exc()
        
        # Fallback if search failed
        return {
            "concept": concept,
            "misconception": misconception,
            "understanding_level": understanding_level,
            "recommendations": [
                {
                    "title": f"Introduction to {concept}",
                    "type": "Video",
                    "difficulty": "Beginner",
                    "content_preview": f"Learn the fundamentals of {concept}.",
                    "relevance_score": 0.9
                }
            ]
        }

def recommend_learning_resources(concept, misconception, understanding_level, question_text=None, student_answer=None):
    """
    Main entry point for Feature 8. 
    NOTE: This now redirects to the new Gemini-based recommendation engine.
    The old FAISS-based system is deprecated in favor of AI-generated personalized recommendations.
    """
    # Use new Gemini-based recommendation engine
    try:
        from .gemini_recommendation_engine import recommend_learning_resources as gemini_recommend
        return gemini_recommend(concept, misconception, understanding_level, question_text, student_answer)
    except Exception as e:
        print(f"[Feature8] Error using Gemini engine, falling back to old system: {e}")
        # Fallback to old system if Gemini fails
        engine = RecommendationEngine()
        return engine.recommend(concept, misconception, understanding_level)

if __name__ == "__main__":
    # Example usage for testing standalone
    res = recommend_learning_resources(
        concept="Photosynthesis",
        misconception="Plants get their food from soil",
        understanding_level="basic"
    )
    import json
    print(json.dumps(res, indent=4))
