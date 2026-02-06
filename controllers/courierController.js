const Courier=require("../models/courierModel");
const catchAsync = require('../utils/catchAsync');

exports.createCourier=catchAsync(async (req,res,next)=>{
    const newCourier=await Courier.create(req.body);
    res.status(201).json({
        status: 'success',
        data: {
          courier: newCourier
        }
      });
});

exports.findCouriersByStatusAndRegion=catchAsync(async (req,res,next)=>{
     const couriers=await Courier.find({status:true,region:req.params.region});
     res.status(200).json({
        status: 'success',
        results: couriers.length,
        data: {
          couriers
        }
      });
});


exports.rateCourier=catchAsync(async(req,res,next)=>{
    const result=await Courier.updateOne({_id:req.body.courierId,"ratings.individualId":req.body.userId},{$set:{"ratings.$.rate":req.body.rate}});
    if(result.matchedCount===0){
        await Courier.updateOne({_id:req.body.courierId},{$push:{ratings:{individualId:req.body.userId,rate:req.body.rate}}});
    }
    const courier=await Courier.findOne({_id:req.body.courierId});
    res.status(200).json({
        data: {
          courier
        }
      });
});

exports.changeStatus=catchAsync(async(req,res,next)=>{
    const courier=await Courier.findOneAndUpdate({_id:req.body.courierId},{$set:{status:{$not:"$status"}}});
    res.status(200).json({
        data:{
            courier
        }
    });
});

exports.updateCourier=catchAsync(async(req,res,next)=>{
    await Courier.updateOne({_id:req.body._id},req.body);
    const courier=await Courier.findById(req.body._id);
    res.status(200).json({
        data:{
            courier
        }
    });
});

exports.deleteCourier=catchAsync(async(req,res,next)=>{
    const result=await Courier.deleteOne({_id:req.body._id});
    if(result.deletedCount){
        res.status(204).json({
            message:"Deleted"
        });
    }
    else{
        res.status(401).json({
            message:"Given courier doesn't exist"
        });
    }
})