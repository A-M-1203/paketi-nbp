const mongoose = require("mongoose");
const Branch = require("./models/branchModel");
const dotenv = require("dotenv");
const Courier = require("./models/courierModel");
const bcrypt = require("bcrypt");

dotenv.config({ path: "./config.env" });

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB).then((con) => console.log("DB connection successful"));

const branches = [
  {
    name: "Užice 1",
    address: "Dimitrija Tucovica 3",
    location: { type: "Point", coordinates: [43.855, 19.8425] },
  },
  {
    name: "Leskovac 1",
    address: "Bulevar Oslobodjenja 7",
    location: { type: "Point", coordinates: [42.9981, 21.9465] },
  },
  {
    name: "Kraljevo 1",
    address: "Trg srpskih ratnika 3",
    location: { type: "Point", coordinates: [43.7258, 20.6897] },
  },
  {
    name: "Čačak 1",
    address: "Gospodar Jovanova 10",
    location: { type: "Point", coordinates: [43.8914, 20.3497] },
  },
  {
    name: "Zrenjanin 1",
    address: "Kralja Aleksandra I Karađorđevića 3",
    location: { type: "Point", coordinates: [45.3814, 20.3861] },
  },
  {
    name: "Subotica 1",
    address: "Korzo 20",
    location: { type: "Point", coordinates: [46.1005, 19.665] },
  },
  {
    name: "Kragujevac 1",
    address: "Kralja Aleksandra I Karađorđevića 2",
    location: { type: "Point", coordinates: [44.0128, 20.9114] },
  },
  {
    name: "Beograd 1",
    address: "Knez Mihailova 22",
    location: { type: "Point", coordinates: [44.8125, 20.4612] },
  },
  {
    name: "Novi Sad 1",
    address: "Zmaj Jovina 11",
    location: { type: "Point", coordinates: [45.2671, 19.8335] },
  },
  {
    name: "Niš 1",
    address: "Obrenovićeva 56",
    location: { type: "Point", coordinates: [43.3209, 21.8958] },
  },
];

async function seed() {
  const hashedPassword = await bcrypt.hash("kurir123", 12);

  const couriers = [
    {
      fullName: "Marko Markovic",
      phone: "0641234567",
      vehicle: { type: "auto", plateNumber: "BG-123-AB" },
      status: true,
      region: "Beograd",
      email: "marko@kurir.com",
      password: hashedPassword
    },
    {
      fullName: "Petar Petrovic",
      phone: "0651234567",
      vehicle: { type: "auto", plateNumber: "NS-456-CD" },
      status: true,
      region: "Novi Sad",
      email: "petar@kurir.com",
      password: hashedPassword
    }
  ];

  await Branch.deleteMany();
  await Branch.insertMany(branches);
  await Courier.deleteMany();
  await Courier.insertMany(couriers);
  mongoose.connection.close();
}

seed();
