const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

// Hash password before saving - Using async/await for Mongoose v9+
userSchema.pre('save', async function(next) {
  const user = this;
  if (!user.isModified('password')) return next();

  try {
    console.log('Hashing password for:', user.email);
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
    console.log('Password hashed successfully');
    next();
  } catch (err) {
    console.error('Bcrypt error:', err);
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
