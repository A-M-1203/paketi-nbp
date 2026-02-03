const Individual = require('../models/individualModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.createIndividual = catchAsync(async (req, res, next) => {
  const newIndividual = await Individual.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      individual: newIndividual
    }
  });
});

exports.getAllIndividuals = catchAsync(async (req, res, next) => {
  const individuals = await Individual.find({ isActive: { $ne: false } });

  res.status(200).json({
    status: 'success',
    results: individuals.length,
    data: {
      individuals
    }
  });
});

exports.getIndividual = catchAsync(async (req, res, next) => {
  const individual = await Individual.findById(req.params.id);

  if (!individual || !individual.isActive) {
    return next(new AppError('No individual found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      individual
    }
  });
});

exports.updateIndividual = catchAsync(async (req, res, next) => {
  const individual = await Individual.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  if (!individual) {
    return next(new AppError('No individual found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      individual
    }
  });
});

exports.deleteIndividual = catchAsync(async (req, res, next) => {
  const individual = await Individual.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!individual) {
    return next(new AppError('No individual found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
