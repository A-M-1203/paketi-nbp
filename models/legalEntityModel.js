const mongoose = require('mongoose');

const legalEntitySchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true
  },
  taxId: {
    type: String,
    required: [true, 'Tax ID is required'],
    unique: [true, 'This Tax ID is already in use'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: [true, 'User with this email already exists'],
    trim: true,
    lowercase: true
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true
  },
  address: {
    type: String,
    required: [true, 'Address is required'],
    trim: true
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  isActive:{
    type: Boolean,
    default: true,
    select: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LegalEntity', legalEntitySchema);
