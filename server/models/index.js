require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false,
  }
);

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Expense = require("./expense")(sequelize);
db.Category = require("./category")(sequelize, Sequelize);

module.exports = db;
