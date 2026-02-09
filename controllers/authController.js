const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const createSendToken = (user, statusCode, res, refreshToken = null) => {
  const token = createToken(user._id);

  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);
  cookieOptions = {
    expires: new Date(
      Date.now() + process.env.REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);

  user.password = undefined;
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;

  res.status(statusCode).json({
    status: 'success',
    data: user
  });
};

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

exports.signup = catchAsync(async (req, res, next) => {
  const body = stripRoleFields(req.body);
  if (body.phoneNumber != null) body.phoneNumber = String(body.phoneNumber);
  if (body.postalCode != null) body.postalCode = String(body.postalCode);
  const newUser = await User.create(body);

  const refreshToken = crypto.randomBytes(8).toString('hex');
  newUser.refreshToken = refreshToken;
  newUser.refreshTokenExpires = new Date(
    Date.now() +
      process.env.REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000
  );
  await newUser.save({ validateBeforeSave: false });

  createSendToken(newUser, 201, res, refreshToken);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email, isActive: { $ne: false } }).select(
    '+password'
  );

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  const refreshToken = crypto.randomBytes(8).toString('hex');
  user.refreshToken = refreshToken;
  user.refreshTokenExpires = new Date(
    Date.now() +
      process.env.REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000
  );
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, refreshToken);
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  const refreshToken = req.body.refreshToken;

  if (!refreshToken) {
    return next(new AppError('Refresh token is required', 400));
  }

  const user = await User.findOne({
    refreshToken,
    refreshTokenExpires: { $gt: Date.now() },
    isActive: { $ne: false }
  }).select('+refreshToken +refreshTokenExpires');

  if (!user) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  const newRefreshToken = crypto.randomBytes(8).toString('hex');
  user.refreshToken = newRefreshToken;
  user.refreshTokenExpires = new Date(
    Date.now() +
      process.env.REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000
  );
  await user.save({ validateBeforeSave: false });

  createSendToken(user, 200, res, newRefreshToken);
});

exports.protect = catchAsync(async (req, res, next) => {
  const token =
    req.body.token ||
    (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
      ? req.headers.authorization.split(' ')[1]
      : null);

  if (!token) {
    return next(new AppError('Please log in again', 401));
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || user.isActive === false) {
    return next(new AppError('Please log in again', 401));
  }

  req.user = user;
  next();
});
