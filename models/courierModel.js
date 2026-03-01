const mongoose=require('mongoose');

const bcrypt = require('bcrypt');


const courierSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:[true,"Puno ime je obavezno"],
        trim:true
    },
    phone:{
        type:String,
        required:[true,"Telefon je obavezan"],
        trim:true
    },
    vehicle:{
        type:{
            type:String
        },
        plateNumber:{
            type:String,
            required:[true,"Registarska tablica je obavezna"]
        }
    },
    status:{
        type:Boolean,
        required:[true,"Status je obavezan"]
    },
    ratings:[{
        rate:Number,
        email:String
    }],
    region:{
        type:String,
        required:[true,"Region je obavezan"]
    },
    //dodato zbg login za kurira
    accessToken: {
        type: String,
        default: null
    },
    email: {
        type: String,
        trim: true,
        lowercase: true
    },
    password: {
        type: String
    }
});

courierSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

module.exports=mongoose.model("Courier",courierSchema);