const express=require('express');
const authController=require('../controllers/authController');
const shipmentControllers=require('../controllers/shipmentController');

const router=express.Router();
//Sad samo ulogovani user može da brise
router.route("/").post(authController.protect('fizicko lice', 'pravno lice'), shipmentControllers.createShipment).put(shipmentControllers.updateShipment).delete(authController.protect('fizicko lice', 'pravno lice'), shipmentControllers.deleteShipment);

router.route("/finished").get(authController.protect('fizicko lice', 'pravno lice'), shipmentControllers.getShipmentsFinished).put(shipmentControllers.finishShipment);

router.route("/unfinished").get(authController.protect('fizicko lice', 'pravno lice'), shipmentControllers.getShipmentsUnFinished);

router.route("/my-sent").get(authController.protect('fizicko lice', 'pravno lice'), shipmentControllers.getMySentShipments);
router.route("/my-received").get(authController.protect('fizicko lice', 'pravno lice'), shipmentControllers.getMyReceivedShipments);

router.route("/getCouirierShip").get(shipmentControllers.getBasenOnCourier);

router.route("/status").put(authController.protectCourier, shipmentControllers.addStatus);

router.route("/assign").put(shipmentControllers.setBranchId);

router.route("/assign-courier").put(shipmentControllers.assignCourier);

module.exports=router;