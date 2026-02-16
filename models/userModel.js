const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    role: {
      type: String,
      required: [true, 'Uloga je obavezna'],
      enum: {
        values: ['fizicko lice', 'pravno lice'],
        message: 'Uloga mora biti fizicko lice ili pravno lice'
      }
    },
    firstName: {
      type: String,
      maxlength: [50, 'Ime može imati najviše 50 karaktera'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'Ime može sadržati samo slova i razmake'
      }
    },
    lastName: {
      type: String,
      maxlength: [50, 'Prezime može imati najviše 50 karaktera'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z\s]+$/.test(v);
        },
        message: 'Prezime može sadržati samo slova i razmake'
      }
    },
    companyName: {
      type: String,
      maxlength: [100, 'Naziv firme može imati najviše 100 karaktera'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s]+$/.test(v);
        },
        message: 'Naziv firme može sadržati samo slova, brojeve i razmake'
      }
    },
    taxId: {
      type: String,
      minlength: [5, 'PIB mora imati najmanje 5 karaktera'],
      maxlength: [25, 'PIB može imati najviše 25 karaktera'],
      trim: true,
      unique: true,
      sparse: true
    },
    email: {
      type: String,
      required: [true, 'Email adresa je obavezna'],
      trim: true,
      lowercase: true,
      unique: true,
      minlength: [6, 'Email mora imati najmanje 6 karaktera'],
      maxlength: [254, 'Email može imati najviše 254 karaktera'],
      validate: {
        validator: function (v) {
          return validator.isEmail(v);
        },
        message: 'Unesite ispravnu email adresu'
      }
    },
    phoneNumber: {
      type: String,
      required: [true, 'Broj telefona je obavezan'],
      trim: true,
      set: function (v) {
        if (v == null || v === '') return v;
        return String(v).replace(/\s/g, '');
      },
      minlength: [8, 'Broj telefona mora imati najmanje 8 cifara'],
      maxlength: [15, 'Broj telefona može imati najviše 15 cifara'],
      validate: {
        validator: function (v) {
          return /^\d+$/.test(v);
        },
        message: 'Broj telefona može sadržati samo cifre'
      }
    },
    city: {
      type: String,
      required: [true, 'Grad je obavezan'],
      maxlength: [50, 'Naziv grada može imati najviše 50 karaktera'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s]+$/.test(v);
        },
        message: 'Naziv grada može sadržati samo slova, brojeve i razmake'
      }
    },
    address: {
      type: String,
      required: [true, 'Adresa je obavezna'],
      maxlength: [100, 'Adresa može imati najviše 100 karaktera'],
      trim: true,
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s]+$/.test(v);
        },
        message: 'Adresa može sadržati samo slova, brojeve i razmake'
      }
    },
    postalCode: {
      type: String,
      required: [true, 'Poštanski broj je obavezan'],
      minlength: [3, 'Poštanski broj mora imati najmanje 3 karaktera'],
      maxlength: [10, 'Poštanski broj može imati najviše 10 karaktera'],
      trim: true,
      set: function (v) {
        if (v == null || v === '') return v;
        return String(v);
      },
      validate: {
        validator: function (v) {
          return /^[a-zA-Z0-9\s\-]+$/.test(v);
        },
        message: 'Poštanski broj može sadržati samo slova, brojeve, razmake i crticu'
      }
    },
    password: {
      type: String,
      required: [true, 'Lozinka je obavezna'],
      minlength: [4, 'Lozinka mora imati najmanje 4 karaktera'],
      maxlength: [50, 'Lozinka može imati najviše 50 karaktera'],
      select: false
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Potvrda lozinke je obavezna'],
      validate: {
        validator: function (el) {
          return !this.password || el === this.password;
        },
        message: 'Lozinke se ne poklapaju'
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
    if (!this.firstName) this.invalidate('firstName', 'Ime je obavezno za fizičko lice');
    if (!this.lastName) this.invalidate('lastName', 'Prezime je obavezno za fizičko lice');
  }
  if (this.role === 'pravno lice') {
    if (!this.companyName) this.invalidate('companyName', 'Naziv firme je obavezan za pravno lice');
    if (!this.taxId) this.invalidate('taxId', 'PIB je obavezan za pravno lice');
  }
});

module.exports = mongoose.model('User', userSchema);
