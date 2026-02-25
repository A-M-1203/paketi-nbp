const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const createToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

const createSendToken = (user, statusCode, res, refreshToken = null) => {
  const token = createToken(user._id, user.role);

  let cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  if (refreshToken) {
    cookieOptions = {
      expires: new Date(
        Date.now() + process.env.REFRESH_TOKEN_EXPIRES_IN * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    };
    res.cookie('refreshToken', refreshToken, cookieOptions);
  }
  
  user.password = undefined;
  user.refreshToken = undefined;
  user.refreshTokenExpires = undefined;

  const payload = { status: 'success', data: user, token };
  if (refreshToken) payload.refreshToken = refreshToken;
  res.status(statusCode).json(payload);
};

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

exports.signup = catchAsync(async (req, res, next) => {
  const body = stripRoleFields(req.body);
  if (body.phoneNumber != null) body.phoneNumber = String(body.phoneNumber);
  if (body.postalCode != null) body.postalCode = String(body.postalCode);
  await User.create(body);

  res.status(201).json({
    status: 'success',
    message: 'Successfully registered.'
  });
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
  });

  if (!user) {
    return next(new AppError('Invalid or expired refresh token', 401));
  }

  createSendToken(user, 200, res);
});

exports.getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    status: 'success',
    data: { user: req.user }
  });
});

exports.protect = (...allowedRoles) => {
  return catchAsync(async (req, res, next) => {
    let token = null;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/\bjwt=([^;]+)/);
      if (match) token = match[1].trim();
    }

    if (!token) {
      return next(new AppError('Please log in again', 401));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return next(
          new AppError('Your token has expired. Please log in again.', 401)
        );
      }
      if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
      return next(err);
    }

    const user = await User.findById(decoded.id);

    if (!user || user.isActive === false) {
      return next(new AppError('Please log in again', 401));
    }

    const role = decoded.role ?? user.role;
    if (allowedRoles.length > 0 && !allowedRoles.includes(role)) {
      return next(
        new AppError('You do not have permission to access this route', 403)
      );
    }

    req.user = user;
    next();
  });
};
