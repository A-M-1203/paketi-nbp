const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function stripRoleFields(body) {
  const b = { ...body };
  if (b.role === 'fizicko lice') {
    delete b.companyName;
    delete b.taxId;
  }
  if (b.role === 'pravno lice') {
    delete b.firstName;
    delete b.lastName;
  }
  return b;
}

exports.createUser = catchAsync(async (req, res, next) => {
  const newUser = await User.create(stripRoleFields(req.body));

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser
    }
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({ isActive: { $ne: false } });

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  if (!user || !user.isActive) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

const ALLOWED_UPDATE_FIELDS = [
  'firstName', 'lastName', 'companyName', 'taxId',
  'phoneNumber', 'city', 'address', 'postalCode'
];

exports.updateMe = catchAsync(async (req, res, next) => {
  const body = {};
  ALLOWED_UPDATE_FIELDS.forEach((field) => {
    if (req.body[field] !== undefined) body[field] = req.body[field];
  });
  if (req.user.role === 'fizicko lice') {
    delete body.companyName;
    delete body.taxId;
  } else {
    delete body.firstName;
    delete body.lastName;
  }
  const user = await User.findByIdAndUpdate(req.user.id, body, {
    new: true,
    runValidators: true
  });
  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }
  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user || !user.isActive) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const existing = await User.findById(req.params.id);
  if (!existing) {
    return next(new AppError('No user found with that ID', 404));
  }
  const body = stripRoleFields({ ...req.body, role: existing.role });
  const user = await User.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!user) {
    return next(new AppError('No user found with that ID', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null
  });
});
