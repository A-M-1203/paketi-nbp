const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Naziv je obavezan'],
        maxlength: [100, 'Naziv može imati najviše 100 karaktera'],
        trim: true,
        validate: {
            validator: function (v) {
            return /^[a-zA-Z0-9\s]+$/.test(v);
            },
            message: 'Naziv može sadržati samo slova, brojeve i razmake'
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
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: ['Point']
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});

branchSchema.index({location:"2dsphere"});

module.exports=mongoose.model("Branch",branchSchema);
