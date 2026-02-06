const mongoose=require('mongoose');

const vehicleSchema=new mongoose.Schema({
    type:{
        type:String
    },
    plateNumber:{
        type:String,
        required:[true,"Plate number is required"]
    }
});

const rating=new mongoose.Schema({
    rate:Number,
    individualId:{
        type:mongoose.Schema.ObjectId,
        ref:"Individual"
        }
});

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
        type:vehicleSchema,
        required:[true,"Vehicle is required"]
    },
    status:{
        type:Boolean,
        required:[true,"Status is required"]
    },
    ratings:[rating],
    region:{
        type:String,
        required:[true,"Region is required"]
    }
});

module.exports=mongoose.model("Courier",courierSchema);