const mongoose=require('mongoose');


const courierSchema=new mongoose.Schema({
    fullName:{
        type:String,
        required:[true,"Full name is required"],
        trim:true
    },
    phone:{
        type:String,
        required:[true,"Phone is required"],
        trim:true
    },
    vehicle:{
        type:{
            type:String
        },
        plateNumber:{
            type:String,
            required:[true,"Plate number is required"]
        }
    },
    status:{
        type:Boolean,
        required:[true,"Status is required"]
    },
    ratings:[{
        rate:Number,
        email:String
    }],
    region:{
        type:String,
        required:[true,"Region is required"]
    }
});

module.exports=mongoose.model("Courier",courierSchema);