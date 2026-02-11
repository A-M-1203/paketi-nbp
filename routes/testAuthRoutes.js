const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

router.get(
  '/any',
  authController.protect(),
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Dostupno svim prijavljenim korisnicima',
      user: { id: req.user._id, email: req.user.email, role: req.user.role }
    });
  }
);

router.get(
  '/fizicko-lice',
  authController.protect('fizicko lice'),
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Dostupno samo korisnicima sa ulogom fizicko lice',
      user: { id: req.user._id, email: req.user.email, role: req.user.role }
    });
  }
);

router.get(
  '/pravno-lice',
  authController.protect('pravno lice'),
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Dostupno samo korisnicima sa ulogom pravno lice',
      user: { id: req.user._id, email: req.user.email, role: req.user.role }
    });
  }
);

router.get(
  '/both',
  authController.protect('fizicko lice', 'pravno lice'),
  (req, res) => {
    res.status(200).json({
      status: 'success',
      message: 'Dostupno i fizickom i pravnom licu',
      user: { id: req.user._id, email: req.user.email, role: req.user.role }
    });
  }
);

module.exports = router;
