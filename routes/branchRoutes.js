const express=require('express');
const branchController=require('../controllers/branchController');

const router=express.Router();

router.route("").get(branchController.getNearest).post(branchController.createBranch).put(branchController.updateBranch).delete(branchController.deleteBranch);

module.exports=router;