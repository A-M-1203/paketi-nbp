const express=require('express')
const shipmentControllers=require('../controllers/shipmentController');

const router=express.Router()

router.route("/").post(shipmentControllers.createShipment).put(shipmentControllers.updateShipment).delete(shipmentControllers.deleteShipment);

router.route("/finished").get(shipmentControllers.getShipmentsFinished).put(shipmentControllers.finishShipment);

router.route("/unfinished").get(shipmentControllers.getShipmentsUnFinished);

router.route("/getCouirierShip").get(shipmentControllers.getBasenOnCourier);

router.route("/status").put(shipmentControllers.addStatus);

module.exports=router;