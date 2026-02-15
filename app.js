// fajl za konfiguraciju express-a
const path = require('path');
const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const userRouter = require('./routes/userRoutes');
const authRouter = require('./routes/authRoutes');
const courierRouter=require('./routes/courierRoutes');
const shipmentRouter=require("./routes/shipmentRoutes");
const branchRouter=require('./routes/branchRoutes');
const testAuthRouter = require('./routes/testAuthRoutes');

const app = express();

// CORS – dozvoljeni su zahtevi sa file:// (origin null) i sa drugih domena u development-u
app.use(function (req, res, next) {
  const origin = req.headers.origin;
  if (origin) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'null');
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// logging samo u development-u
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// body data je ogranicen na 10kb (vise od toga se ne prihvata)
app.use(
  express.json({
    limit: '10kb',
  })
);

// rute
app.use('/api/v1/users', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/courier/',courierRouter);
app.use("/api/v1/shipment/",shipmentRouter);
app.use("/api/v1/branch/",branchRouter);
app.use('/api/v1/test-auth', testAuthRouter);

app.use(express.static(path.join(__dirname, 'Client')));

app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;