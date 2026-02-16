const mongoose = require('mongoose');
const validator = require('validator');

const shipmentSchema=new mongoose.Schema({
    sender: {
        userId: {
            required: [true, "Pošiljalac je obavezan"],
            type: mongoose.Schema.ObjectId,
            ref: "User"
        },
        name: {
            type: String,
            required: [true, "Ime pošiljaoca je obavezno"],
            trim: true
          },
        email: {
            type: String,
            required: [true, "Email pošiljaoca je obavezan"],
            trim: true,
            lowercase: true,
            validate: {
              validator: (v) => validator.isEmail(v),
              message: "Unesite ispravnu email adresu"
            }
          }
    },
    recipient: {
        userId: {
            type: mongoose.Schema.ObjectId,
            ref: "User",
            default: null
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            minlength: [6, "Email mora imati najmanje 6 karaktera"],
            maxlength: [254, "Email može imati najviše 254 karaktera"],
            validate: {
                validator: function (v) {
                    return validator.isEmail(v);
                },
                message: 'Unesite ispravnu email adresu'
            }
        },
        name: {
            type:String,
            required:[true, "Ime je obavezno"],
            maxlength: [100, "Ime može imati najviše 100 karaktera"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z\s]+$/.test(v);
                },
                message: 'Ime može sadržati samo slova i razmake'
            }
        },
        phoneNumber: {
            type: String,
            required: [true, "Broj telefona je obavezan"],
            minlength: [8, "Broj telefona mora imati najmanje 8 cifara"],
            maxlength: [15, "Broj telefona može imati najviše 15 cifara"],
            validate: {
                validator: function (v) {
                    return /^\d+$/.test(v);
                },
                message: 'Broj telefona može sadržati samo cifre'
            }
        },
        address: {
            type: String,
            required: [true, "Adresa je obavezna"],
            maxlength: [100, "Adresa može imati najviše 100 karaktera"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9\s]+$/.test(v);
                },
                message: 'Adresa može sadržati samo slova, brojeve i razmake'
            }
        },
        city: {
            type: String,
            required: [true, "Grad je obavezan"],
            maxlength: [50, "Grad može imati najviše 50 karaktera"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9\s]+$/.test(v);
                },
                message: 'Grad može sadržati samo slova, brojeve i razmake'
            }
        },
        postalCode: {
            type: String,
            required: [true, "Poštanski broj je obavezan"],
            minlength: [3, "Poštanski broj mora imati najmanje 3 karaktera"],
            maxlength: [10, "Poštanski broj može imati najviše 10 karaktera"],
            trim: true,
            validate: {
                validator: function (v) {
                    return /^[a-zA-Z0-9\s\-]+$/.test(v);
                },
                message: 'Poštanski broj može sadržati samo slova, brojeve, razmake i crticu'
            }
        }
    },
    courier:{
        courierId: {
            type: mongoose.Schema.ObjectId,
            ref: "Courier",
            default: null
        },
        name: {
            type: String,
            trim: true,
            default: null
        }
    },
    weight: {
        type: Number,
        required: [true, "Težina je obavezna"],
        min: [1, "Težina mora biti najmanje 1"],
        max: [1000000, "Težina može biti najviše 1000000"],
        unit: {
            type: String,
            required: [true, "Jedinica je obavezna"],
            enum: {
                values: ['kg', 'g', 'mg', 'lb', 'oz'],
                message: 'Jedinica mora biti jedna od: kg, g, mg, lb, oz'
            },
        }
    },
    statuses: [{
        status: {
            type: String,
            required: [true, 'Status je obavezan'],
            enum: {
                values: ['Preuzimanje pošiljke', 'Pošiljka uneta u sistem', 'Pošiljka u lokalnom centru', 'Pošiljka u skladištu', 'Utovareno za dostavu', 'Isporučeno', 'Neuspela isporuka'],
                message: 'Status mora da bude jedan od: Preuzimanje pošiljke, Pošiljka uneta u sistem, Pošiljka u lokalnom centru, Pošiljka u skladištu, Utovareno za dostavu, Isporučeno, Neuspela isporuka'
            },
            trim: true
        },
        dateTime: {
            type: Date,
            default: Date.now()
        }
    }],
    confirmToken: String,
    confirmUsed: Boolean,
    branchId:{
        type:mongoose.Schema.ObjectId,
        ref: "Branch"
    }
});

module.exports = mongoose.model("Shipment", shipmentSchema);

