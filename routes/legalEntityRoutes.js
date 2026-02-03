const express = require('express');
const legalEntityController = require('../controllers/legalEntityController');

const router = express.Router();

router
  .route('/')
  .get(legalEntityController.getAllLegalEntities)
  .post(legalEntityController.createLegalEntity);

router
  .route('/:id')
  .get(legalEntityController.getLegalEntity)
  .patch(legalEntityController.updateLegalEntity)
  .delete(legalEntityController.deleteLegalEntity);

module.exports = router;
