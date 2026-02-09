const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function stripRoleFields(body) {
  const b = { ...body };
  if (b.role === 'individual') {
    delete b.companyName;
    delete b.taxId;
  }
  if (b.role === 'legal entity') {
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
