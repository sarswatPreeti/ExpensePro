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
    logging: false, // Disable logging in production
  }
);

const db = {};

// Attach Sequelize core objects
db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Initialize models
db.User = require("./user")(sequelize, Sequelize.DataTypes);
db.Expense = require("./expense")(sequelize, Sequelize.DataTypes);
db.Category = require("./category")(sequelize, Sequelize.DataTypes);

// Apply associations automatically if defined
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

module.exports = db;
