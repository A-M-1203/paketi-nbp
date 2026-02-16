const mongoose=require('mongoose');


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
    }
});

module.exports=mongoose.model("Courier",courierSchema);