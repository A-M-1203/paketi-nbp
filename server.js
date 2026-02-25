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
  const openModule = require('open');
  const open = typeof openModule === 'function' ? openModule : openModule.default;
  if (open) open(`http://localhost:${port}/index.html`).catch(() => {});
});

// error handler za async code
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED PROMISE REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});