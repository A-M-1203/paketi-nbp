const mongoose = require('mongoose');
const dotenv = require('dotenv');

// error handler za sync code
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! Shutting down...');
  console.log(err.name, err.message);

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then((con) => console.log('DB connection successful'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// Global Promise Rejection Handler
// error handler za async code
// ne treba treba da se oslanjamo na ove error handler-e nego da
// handle-ujemo exception-e tamo gde se dese
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED PROMISE REJECTION! Shutting down...');
  console.log(err.name, err.message);
  // server ce prvo opsluziti sve request-ove koji se obradjuju
  // ili cekaju na obradjivanje pa se tek onda gasi
  server.close(() => {
    process.exit(1);
  });
});