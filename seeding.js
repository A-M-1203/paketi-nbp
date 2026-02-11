const mongoose = require('mongoose');
const Branch=require('./models/branchModel');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
    '<PASSWORD>',
    process.env.DATABASE_PASSWORD
  );

mongoose.connect(DB).then((con) => console.log('DB connection successful'));

const branches=[
    {
      "name": "Branch 01",
      "address": "Near point N (~780m)",
      "location": { "type": "Point", "coordinates": [21.9023, 43.3335] }
    },
    {
      "name": "Branch 02",
      "address": "Near point S (~780m)",
      "location": { "type": "Point", "coordinates": [21.9023, 43.3195] }
    },
    {
      "name": "Branch 03",
      "address": "Near point E (~730m)",
      "location": { "type": "Point", "coordinates": [21.9113, 43.3265] }
    },
    {
      "name": "Branch 04",
      "address": "Near point W (~730m)",
      "location": { "type": "Point", "coordinates": [21.8933, 43.3265] }
    },
    {
      "name": "Branch 05",
      "address": "Near point NE (~790m)",
      "location": { "type": "Point", "coordinates": [21.9093, 43.3315] }
    },
    {
      "name": "Branch 06",
      "address": "Near point NW (~790m)",
      "location": { "type": "Point", "coordinates": [21.8953, 43.3315] }
    },
    {
      "name": "Branch 07",
      "address": "Near point SE (~790m)",
      "location": { "type": "Point", "coordinates": [21.9093, 43.3215] }
    },
    {
      "name": "Branch 08",
      "address": "Near point SW (~790m)",
      "location": { "type": "Point", "coordinates": [21.8953, 43.3215] }
    },
    {
      "name": "Branch 09",
      "address": "Near point NNE (~920m)",
      "location": { "type": "Point", "coordinates": [21.9053, 43.3345] }
    },
    {
      "name": "Branch 10",
      "address": "Near point SSW (~950m)",
      "location": { "type": "Point", "coordinates": [21.8983, 43.3185] }
    }
  ];

async function seed(){
    await Branch.deleteMany();
    await Branch.insertMany(branches);
    mongoose.connection.close();
}

seed();