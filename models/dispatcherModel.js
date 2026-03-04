const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const dispatcherSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Puno ime je obavezno'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email je obavezan'],
    trim: true,
    lowercase: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Lozinka je obavezna'],
    minlength: [4, 'Lozinka mora imati najmanje 4 karaktera'],
    select: false
  }
});

dispatcherSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

module.exports = mongoose.model('Dispatcher', dispatcherSchema);
