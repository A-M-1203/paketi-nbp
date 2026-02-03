// fajl za konfiguraciju express-a
const express = require('express');
const morgan = require('morgan');

const individualRouter = require('./routes/individualRoutes');
const legalEntityRouter = require('./routes/legalEntityRoutes');

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
app.use('/api/v1/individuals', individualRouter);
app.use('/api/v1/legal-entities', legalEntityRouter);

module.exports = app;