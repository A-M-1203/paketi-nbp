const mongoose=require('mongoose');


const shipmentSchema=new mongoose.Schema({
    sender:{
        individualId:{
            type:mongoose.Schema.ObjectId,
            ref:"Individual"
        },
        name:String,
        email:String
    },
    receipent:{
        email:{
            type:String,
            required:[true,"Email is required"]
        },
        name:String
    },
    courier:{
        courierId:{
            type:mongoose.Schema.ObjectId,
            ref:"Courier"
        },
        name:String
    },
    weight:Number,
    statuses:[{message:{
        type:String,
        required:[true,"Status is required"],
    },
    date:{
        type:Date,
        required:[true,"Date is required"]
    }}],
    confirmToken:String,
    confirmUsed:Boolean
});

module.exports=mongoose.model("Shipment",shipmentSchema);

