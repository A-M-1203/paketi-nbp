const mongoose=require('mongoose');

const branchSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Name is expected"]
    },
    address:{
        type:String,
        required:[true,"Address is required"]
    },
    location:{
        type:{
            type:String,
            enum:["Point"],
            required:true,
            default:["Point"]
        },
        coordinates:{
            type:[Number],
            required:true
        }
    }
});

branchSchema.index({location:"2dsphere"});

module.exports=mongoose.model("Branch",branchSchema);
