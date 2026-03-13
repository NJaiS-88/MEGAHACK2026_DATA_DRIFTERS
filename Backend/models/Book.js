const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  hierarchy: {
    type: Object,
    required: true
  },
  sourceText: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema);
