const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const getUniqueFieldMessage = (field, value) => {
  const v = value != null && value !== '' ? String(value) : '';
  const withValue = v ? ` ${v}` : '';
  const messages = {
    email: `Email address${withValue} already exists.`,
    taxId: `Tax ID${withValue} already exists.`,
    phoneNumber: `Phone number${withValue} already exists.`
  };
  return (
    messages[field] ||
    `${field}${withValue} is already in use. Please use another value.`
  );
};

const handleDuplicateFieldsDB = (err) => {
  const keyValue = err.keyValue || err.errorResponse?.keyValue || {};
  const field = Object.keys(keyValue)[0] || 'field';
  const value = keyValue[field];
  const message = getUniqueFieldMessage(field, value);
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = errors.join('. ');
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Your token has expired. Please log in again.', 401);

const sendErrorDev = (err, res) => {
  const statusCode = err.statusCode || 500;
  const payload = {
    status: err.status || 'error',
    statusCode,
    message: err.message
  };
  if (err.stack) payload.stackTrace = err.stack;
  res.status(statusCode).json(payload);
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      statusCode: err.statusCode,
      message: err.message
    });
    return;
  }
  console.error('ERROR', err);
  res.status(500).json({
    status: 'error',
    statusCode: 500,
    message: 'Something went wrong. Please try again later.'
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  let error = err;
  const code = err.code ?? err.errorResponse?.code;

  if (err.name === 'CastError') {
    error = handleCastErrorDB(err);
  }
  if (code === 11000) {
    error = handleDuplicateFieldsDB(err);
  }
  if (err.name === 'ValidationError') {
    error = handleValidationErrorDB(err);
  }
  if (err.name === 'JsonWebTokenError') {
    error = handleJWTError();
  }
  if (err.name === 'TokenExpiredError') {
    error = handleJWTExpiredError();
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, res);
    return;
  }

  sendErrorProd(error, res);
};
