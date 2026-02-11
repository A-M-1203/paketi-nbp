const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: {
        values: ['fizicko lice', 'pravno lice'],
        message: 'Role must be either fizicko lice or pravno lice'
      }
    },
    firstName: {
      type: String,
      maxlength: [50, 'First name must be at most 50 characters'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'First name must contain only letters and spaces'
      }
    },
    lastName: {
      type: String,
      maxlength: [50, 'Last name must be at most 50 characters'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'Last name must contain only letters and spaces'
      }
    },
    companyName: {
      type: String,
      maxlength: [100, 'Company name must be at most 100 characters'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s]+$/.test(v);
        },
        message: 'Company name must contain only letters, numbers and spaces'
      }
    },
    taxId: {
      type: String,
      minlength: [5, 'Tax ID must be at least 5 characters'],
      maxlength: [25, 'Tax ID must be at most 25 characters'],
      trim: true,
      unique: true,
      sparse: true
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      trim: true,
      lowercase: true,
      unique: true,
      minlength: [6, 'Email must be at least 6 characters'],
      maxlength: [254, 'Email must be at most 254 characters'],
      validate: {
        validator: function (v) {
          return validator.isEmail(v);
        },
        message: 'Please provide a valid email address'
      }
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      set: function (v) {
        if (v == null || v === '') return v;
        return String(v).replace(/\s/g, '');
      },
      minlength: [8, 'Phone number must be at least 8 characters'],
      maxlength: [15, 'Phone number must be at most 15 characters'],
      validate: {
        validator: function (v) {
          return /^\d+$/.test(v);
        },
        message: 'Phone number must contain only digits'
      }
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      maxlength: [50, 'City name must be at most 30 characters'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s]+$/.test(v);
        },
        message: 'City name must contain only letters, numbers and spaces'
      }
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      maxlength: [100, 'Address must be at most 100 characters'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s]+$/.test(v);
        },
        message: 'Address must contain only letters, numbers and spaces'
      }
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      minlength: [3, 'Postal code must be at least 3 characters'],
      maxlength: [10, 'Postal code must be at most 10 characters'],
      trim: true,
      set: function (v) {
        if (v == null || v === '') return v;
        return String(v);
      },
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s\-]+$/.test(v);
        },
        message: 'Postal code must contain only letters, numbers, spaces and hyphen'
      }
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [4, 'Password must be at least 4 characters'],
      maxlength: [50, 'Password must be at most 50 characters'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Password confirmation is required'],
      validate: {
        validator: function (el) {
          return !this.password || el === this.password;
        },
        message: 'Passwords don\'t match'
      },
      select: false
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    refreshToken: {
      type: String,
      select: false
    },
    refreshTokenExpires: {
      type: Date,
      select: false
    },
    isActive: {
      type: Boolean,
      default: true,
      select: false
    }
  },
  { timestamps: true }
);

userSchema.pre('save', function () {
  if (this.role === 'fizicko lice') {
    this.set('companyName', undefined);
    this.set('taxId', undefined);
  }
  if (this.role === 'pravno lice') {
    this.set('firstName', undefined);
    this.set('lastName', undefined);
  }
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
});

userSchema.methods.correctPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('validate', function () {
  if (this.role === 'fizicko lice') {
    if (!this.firstName) this.invalidate('firstName', 'First name is required for fizicko lice');
    if (!this.lastName) this.invalidate('lastName', 'Last name is required for fizicko lice');
  }
  if (this.role === 'pravno lice') {
    if (!this.companyName) this.invalidate('companyName', 'Company name is required for pravno lice');
    if (!this.taxId) this.invalidate('taxId', 'Tax ID is required for pravno lice');
  }
});

module.exports = mongoose.model('User', userSchema);
