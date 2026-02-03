const LegalEntity = require('../models/legalEntityModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createLegalEntity = catchAsync(async (req, res, next) => {
  const newLegalEntity = await LegalEntity.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      legalEntity: newLegalEntity
    }
  });
});

exports.getAllLegalEntities = catchAsync(async (req, res, next) => {
  const legalEntities = await LegalEntity.find({ isActive: { $ne: false } });

  res.status(200).json({
    status: 'success',
    results: legalEntities.length,
    data: {
      legalEntities
    }
  });
});

exports.getLegalEntity = catchAsync(async (req, res, next) => {
  const legalEntity = await LegalEntity.findById(req.params.id);

  if (!legalEntity || !legalEntity.isActive) {
    return next(new AppError('No legal entity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      legalEntity
    }
  });
});

exports.updateLegalEntity = catchAsync(async (req, res, next) => {
  const legalEntity = await LegalEntity.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!legalEntity) {
    return next(new AppError('No legal entity found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      legalEntity
    }
  });
});

exports.deleteLegalEntity = catchAsync(async (req, res, next) => {
  const legalEntity = await LegalEntity.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!legalEntity) {
    return next(new AppError('No legal entity found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
