const Shipment=require('../models/shipmentModel');
const User=require('../models/userModel');
const Courier=require('../models/courierModel');
const catchAsync = require('../utils/catchAsync');

const crypto = require("crypto");

function getSenderDisplayName(user) {
  return user.role === 'individual'
    ? `${user.firstName} ${user.lastName}`.trim()
    : (user.companyName || user.email);
}

module.exports.createShipment=catchAsync(async (req,res,next)=>{
    const user=await User.findOne({_id:req.body.userId});
    const couirer=await Courier.findOne({_id:req.body.couirerId});
    const newShipment=await Shipment.create({sender:{
        userId:user._id,
        name:getSenderDisplayName(user),
        email:user.email
    },
    receipent:{
        email:req.body.receipentEmail,
        name:req.body.receipentFirst+" "+req.body.receipentLast
    },
    courier:{
        courierId:req.body.couirerId,
        name:couirer.fullName    
    },
    weight:req.body.weight,
    statuses:[{ status: 'In warehouse', dateTime: new Date() }],
    confirmUsed:false,
    confirmToken:crypto.randomBytes(16).toString("hex")
});
    res.status(201).json({
        status:"success",
        data:{
            shipment:newShipment
        }
    });
});

module.exports.getShipmentsFinished=catchAsync(async (req,res,next)=>{
    const shipments=await Shipment.find({"sender.userId":req.query.userId,confirmUsed:true});
    res.status(200).json({
        data:{
            shipments
        }
    });
});

module.exports.getShipmentsUnFinished=catchAsync(async (req,res,next)=>{
    const shipments=await Shipment.find({"sender.userId":req.query.userId,confirmUsed:false});
    res.status(200).json({
        data:{
            shipments
        }
    });
});

module.exports.finishShipment=catchAsync(async (req,res,next)=>{
    const suc=await Shipment.updateOne({confirmToken :req.body.token,confirmUsed:false},{confirmUsed:true,$push:{statuses:{status:'Delivered',dateTime:new Date()}}});
    console.log(suc);
    if(suc.modifiedCount===1){
        res.status(200).json({
            status:"success"
        });
    }
    else{
        res.status(400).json({
            status:"Failure"
        })
    }
});

module.exports.updateShipment=catchAsync(async (req,res,next)=>{
    await Shipment.updateOne({_id:req.body._id},req.body);
    const shipment=await Shipment.findById(req.body._id);
    res.status(200).json({
        data:{
            shipment
        }
    });
});

module.exports.addStatus=catchAsync(async (req,res,next)=>{
    await Shipment.updateOne({_id:req.body._id},{$push:{statuses:{status:req.body.status,dateTime:new Date()}}});
    const shipment=await Shipment.findById(req.body._id);
    res.status(200).json({
        data:{
            shipment
        }
    });
});

module.exports.deleteShipment=catchAsync(async (req,res,next)=>{
    const result=await Shipment.deleteOne({_id:req.body._id});
    if(result.deletedCount){
        res.status(204).json({
            message:"Deleted"
        });
    }
    else{
        res.status(401).json({
            message:"Given shipment doesn't exist"
        });
    }
});

module.exports.getBasenOnCourier=catchAsync(async (req,res,next)=>{
    const shipments=await Shipment.find({"courier.courierId":req.query.couirerId,confirmUsed:false});
    res.status(200).json({
        data:{
            shipments
        }
    });
})