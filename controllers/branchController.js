const Branch=require('../models/branchModel');
const catchAsync=require('../utils/catchAsync');

module.exports.createBranch=catchAsync(async(req,res,next)=>{
    const newBrancg=await Branch.create(req.body);
    res.status(201).json({
        message:"Branch created",
        data:{
            branch:newBrancg
        }
    });
});

module.exports.getNearest=catchAsync(async(req,res,next)=>{
    const lng=parseFloat(req.query.lng);
    const lang=parseFloat(req.query.lang);
    const distance=parseFloat(req.query.distance);
    const branches=await Branch.aggregate([{
        $geoNear:{
            near:{type:"Point",coordinates:[lng,lang]},
            distanceField:"distanceMeters",
            spherical:true,
            maxDistance:distance
        }
    },{
        $limit:10
    }]);
    res.status(200).json({
        data:{
            branches
        }
    });
});

module.exports.updateBranch=catchAsync(async(req,res,next)=>{
    const update=await Branch.updateOne({_id:req.body._id},req.body);
    if(update.matchedCount===1){
        const branch=await Branch.findById(req.body._id);
        res.status(200).json({
            status:"success",
            data:{
                branch
            }
        });
    }
    else{
        res.status(400).json({
            status:"failure"
        });
    }
});

module.exports.deleteBranch=catchAsync(async(req,res,next)=>{
    const deleteC=await Branch.deleteOne({_id:req.body._id});
    if(deleteC.deletedCount===1){
        res.status(200).json({
            status:"success"
        });
    }
    else{
        res.status(400).json({
            status:"failure"
        });
    }
})