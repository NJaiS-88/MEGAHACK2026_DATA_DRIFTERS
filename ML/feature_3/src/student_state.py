import json
import os

class StudentState:
    def __init__(self, state_path=None):
        if state_path is None:
            # Default to data/student_state.json relative to feature_3 root
            base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            self.state_path = os.path.join(base_dir, "data", "student_state.json")
        else:
            self.state_path = state_path
        self.states = {}
        self.load_states()

    def load_states(self):
        if os.path.exists(self.state_path):
            with open(self.state_path, 'r') as f:
                self.states = json.load(f)

    def save_states(self):
        os.makedirs(os.path.dirname(self.state_path), exist_ok=True)
        with open(self.state_path, 'w') as f:
            json.dump(self.states, f, indent=2)

    def update_state(self, student_id, concept, correct):
        student_id = str(student_id)
        if student_id not in self.states:
            self.states[student_id] = {}
        
        if concept not in self.states[student_id]:
            self.states[student_id][concept] = {
                "correct": 0,
                "wrong": 0,
                "status": "yellow"
            }
        
        if correct:
            self.states[student_id][concept]["correct"] += 1
        else:
            self.states[student_id][concept]["wrong"] += 1
            
        # Update status
        stats = self.states[student_id][concept]
        total = stats["correct"] + stats["wrong"]
        accuracy = stats["correct"] / total if total > 0 else 0
        
        if accuracy > 0.8:
            stats["status"] = "green"
        elif accuracy >= 0.5:
            stats["status"] = "yellow"
        else:
            stats["status"] = "red"
            
        self.save_states()
        return {
            "concept": concept,
            "status": stats["status"],
            "accuracy": round(accuracy, 2)
        }

    def get_concept_status(self, student_id, concept):
        student_id = str(student_id)
        if student_id in self.states and concept in self.states[student_id]:
            return self.states[student_id][concept]
        return {
            "correct": 0,
            "wrong": 0,
            "status": "yellow"
        }
