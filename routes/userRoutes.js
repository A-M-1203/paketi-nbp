const express = require('express');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

const protect = authController.protect('fizicko lice', 'pravno lice');

router.get('/me', protect, userController.getMe);
router.patch('/me', protect, userController.updateMe);

router.route('/').get(userController.getAllUsers).post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
