// fajl za konfiguraciju express-a
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

app.all('/{*any}', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;