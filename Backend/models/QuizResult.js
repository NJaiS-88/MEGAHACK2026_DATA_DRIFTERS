const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  concept: {
    type: String,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [{
    type: String
  }],
  selectedOption: {
    type: String,
    required: true
  },
  correctAnswer: {
    type: String,
    required: true
  },
  evaluation: {
    score: Number,
    result: String,
    feedback: String
  }
}, { timestamps: true });

module.exports = mongoose.model('QuizResult', quizResultSchema);
