const express=require('express');
const courierController=require('../controllers/courierController');

const router=express.Router();

router.route("/")
.post(courierController.createCourier)
.put(courierController.updateCourier)
.delete(courierController.deleteCourier);

router.route("/all")
.get(courierController.getAllCouriers);

router.route("/find")
.get(courierController.findCouriersByStatusAndRegion);

router.route("/changeStatus")
.put(courierController.changeStatus);

router.route("/rate")
.put(courierController.rateCourier);

router.route("/login")
.post(courierController.courierLogin);

module.exports=router;