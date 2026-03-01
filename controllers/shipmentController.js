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
    //promenio da "automatski pronadje kurira, napravicemo jednog samo za testiranje "
    const courier = await Courier.findOne({ status: true });
    if (courier) {
        shipmentData.courier = {
            courierId: courier._id,
            name: courier.fullName
        };
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
    mailSender(req.body.receipentEmail,"Status update",JSON.stringify(newShipment)).catch(()=>{});
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
        mailSender(shipment.recipient.email,"Status update",JSON.stringify(shipment)).catch(()=>{});
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
//IZMENJANA FUNKCIJA za kurira da moze da menja status posiljke 
module.exports.addStatus = catchAsync(async (req,res,next) => {
    const shipment = await Shipment.findById(req.body._id);

    if (!shipment) {
        return res.status(404).json({ message: 'Pošiljka nije pronađena' });
    }

    if (!shipment.courier.courierId || shipment.courier.courierId.toString() !== req.courier._id.toString()) {
        return res.status(403).json({ message: 'Niste dodeljeni ovoj pošiljci' });
    }

    await Shipment.updateOne({ _id: req.body._id }, { $push: { statuses: { status: req.body.status, dateTime: new Date() } } });
    const updated = await Shipment.findById(req.body._id);

    res.status(200).json({ data: { shipment: updated } });
    mailSender(updated.recipient.email, "Status update", JSON.stringify(updated)).catch(()=>{});
});
// provera da li mu pripada posljika i brisanje
module.exports.deleteShipment = catchAsync(async (req,res,next) => {
    const shipment = await Shipment.findById(req.body._id);

    if (!shipment) {
        return res.status(404).json({ message: 'Pošiljka nije pronađena' });
    }

    if (shipment.sender.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Nemate pravo da obrišete ovu pošiljku' });
    }

    await Shipment.deleteOne({ _id: req.body._id });

    res.status(200).json({ message: 'Pošiljka je obrisana' });
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