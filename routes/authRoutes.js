const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

const protect = authController.protect('fizicko lice', 'pravno lice');

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refreshToken);
router.get('/me', protect, authController.getMe);

module.exports = router;
