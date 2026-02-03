const express = require('express');
const individualController = require('../controllers/individualController');

const router = express.Router();

router
  .route('/')
  .get(individualController.getAllIndividuals)
  .post(individualController.createIndividual);

router
  .route('/:id')
  .get(individualController.getIndividual)
  .patch(individualController.updateIndividual)
  .delete(individualController.deleteIndividual);

module.exports = router;
