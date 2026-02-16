const Shipment = require('../models/shipmentModel');
const User = require('../models/userModel');
const Courier = require('../models/courierModel');

const catchAsync = require('../utils/catchAsync');
const mailSender = require('../utils/mail');

const crypto = require("crypto");

function getSenderDisplayName(user) {
  return user.role === 'fizicko lice'
    ? `${user.firstName} ${user.lastName}`.trim()
    : (user.companyName || user.email);
}

module.exports.createShipment = catchAsync(async (req,res,next) => {
    const user = req.user;
    const shipmentData = {
        sender: {
            userId: user._id,
            name: getSenderDisplayName(user),
            email: user.email
        },
        recipient: {
            email: req.body.receipentEmail,
            name: req.body.receipentFirst + " " + req.body.receipentLast,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            city: req.body.city,
            postalCode: req.body.postalCode
        },
        weight: req.body.weight,
        statuses: [{ status: 'Pošiljka uneta u sistem', dateTime: new Date() }],
        confirmUsed: false,
        confirmToken: crypto.randomBytes(16).toString("hex")
    };
    if (req.body.couirerId) {
        const courier = await Courier.findOne({ _id: req.body.couirerId });
        if (courier) {
            shipmentData.courier = {
                courierId: courier._id,
                name: courier.fullName
            };
        }
    }
    const recipientUser = await User.findOne({ email: (req.body.receipentEmail || '').toLowerCase().trim(), isActive: { $ne: false } });
    if (recipientUser) {
        shipmentData.recipient.userId = recipientUser._id;
    }
    const newShipment = await Shipment.create(shipmentData);
    res.status(201).json({
        status:"success",
        data:{
            shipment:newShipment
        }
    });
    mailSender(req.body.receipentEmail,"Status update",JSON.stringify(newShipment));
});

module.exports.getShipmentsFinished=catchAsync(async (req,res,next)=>{
    const shipments=await Shipment.find({"sender.userId":req.user._id,confirmUsed:true});
    res.status(200).json({
        data:{
            shipments
        }
    });
});

module.exports.getShipmentsUnFinished = catchAsync(async (req,res,next)=> {
    const shipments=await Shipment.find({"sender.userId":req.user._id,confirmUsed:false});
    res.status(200).json({
        data:{
            shipments
        }
    });
});

module.exports.getMySentShipments = catchAsync(async (req,res,next) => {
    const shipments=await Shipment.find({"sender.userId":req.user._id}).sort({ _id: -1 });
    res.status(200).json({
        data: { shipments }
    });
});

module.exports.getMyReceivedShipments = catchAsync(async (req,res,next) => {
    const shipments=await Shipment.find({
        $or: [
            { "recipient.userId": req.user._id },
            { "recipient.email": req.user.email }
        ]
    }).sort({ _id: -1 });
    res.status(200).json({
        data: { shipments }
    });
});

module.exports.finishShipment = catchAsync(async (req,res,next) => {
    const suc=await Shipment.updateOne({confirmToken :req.body.token,confirmUsed:false},{confirmUsed:true,$push:{statuses:{status:'Isporučeno',dateTime:new Date()}}});
    console.log(suc);
    const shipment=await Shipment.findOne({confirmToken:req.body.token});
    if(suc.modifiedCount===1){
        res.status(200).json({
            status:"success"
        });
        mailSender(shipment.recipient.email,"Status update",JSON.stringify(shipment));
    }
    else{
        res.status(400).json({
            status:"Failure"
        })
    }
    
});

module.exports.updateShipment = catchAsync(async (req,res,next) => {
    await Shipment.updateOne({_id:req.body._id},req.body);
    const shipment=await Shipment.findById(req.body._id);
    res.status(200).json({
        data:{
            shipment
        }
    });
});

module.exports.addStatus = catchAsync(async (req,res,next) => {
    await Shipment.updateOne({_id:req.body._id},{$push:{statuses:{status:req.body.status,dateTime:new Date()}}});
    const shipment=await Shipment.findById(req.body._id);
    res.status(200).json({
        data:{
            shipment
        }
    });
    mailSender(shipment.recipient.email,"Status update",JSON.stringify(shipment));
});

module.exports.deleteShipment = catchAsync(async (req,res,next) => {
    const result = await Shipment.deleteOne({_id:req.body._id});
    if(result.deletedCount){
        res.status(204).json({
            message:"Pošiljka je obrisana"
        });
    }
    else{
        res.status(401).json({
            message:"Pošiljka nije pronađena"
        });
    }
});

module.exports.getBasenOnCourier = catchAsync(async (req,res,next) => {
    const shipments = await Shipment.find({"courier.courierId":req.query.couirerId,confirmUsed:false});
    res.status(200).json({
        data:{
            shipments
        }
    });
})

module.exports.setBranchId = catchAsync(async (req,res,next) => {
    const result=await Shipment.updateOne({_id:req.body._id},{branchId:req.body.branchId});
    const shipment=await Shipment.findById(req.body._id);
    if(result.matchedCount===1){
        res.status(200).json({
            status:"success"
        });
        mailSender(shipment.recipient.email,"Branch added","You were able to set branchid");
    }
    else{
        res.status(400).json({
            status:"failure"
        });
    }
    
});

module.exports.assignCourier = catchAsync(async (req,res,next) => {
    const courier=await Courier.findOne({_id:req.body.courierId});
    if(!courier){
        return res.status(400).json({
            status:"failure",
            message:"Kurir nije pronađen"
        });
    }
    const result=await Shipment.updateOne(
        {_id:req.body._id},
        {$set:{courier:{courierId:courier._id,name:courier.fullName}}}
    );
    const shipment=await Shipment.findById(req.body._id);
    if(result.matchedCount===1){
        res.status(200).json({
            status:"success",
            data:{shipment}
        });
    }
    else{
        res.status(400).json({
            status:"failure",
            message:"Pošiljka nije pronađena"
        });
    }
});