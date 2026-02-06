const mongoose=require('mongoose');

const individualSchema=new mongoose.Schema({
    individualId:{
        type:mongoose.Schema.ObjectId,
        ref:"Individual"
    },
    name:String
});

const courierSchema=new mongoose.Schema({
    courierId:{
        type:mongoose.Schema.ObjectId,
        ref:"Courier"
    },
    name:String
});

const statusSchema=new mongoose.Schema({
    status:{
        type:String,
        required:[true,"Status is required"]
    },
    date:{
        type:Date,
        required:[true,"Date is required"]
    }
});

const shipmentSchema=new mongoose.Schema({
    sender:individualSchema,
    receipent:individualSchema,
    courier:courierSchema,
    weight:Number,
    statuses:[statusSchema]
});

module.exports=mongoose.model("Shipment",shipmentSchema);

