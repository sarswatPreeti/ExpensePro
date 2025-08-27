require("dotenv").config();
const { Sequelize } = require("sequelize");
// Reuse the centralized, SSL-aware Sequelize instance
const sequelize = require("../config/database");

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.User = require("./user")(sequelize, Sequelize.DataTypes);
db.Category = require("./category")(sequelize, Sequelize.DataTypes);
db.Expense = require("./expense")(sequelize, Sequelize.DataTypes);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Safe sync - no force:true in production
db.sync = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    await sequelize.sync({ alter: true }); // alter instead of force
    console.log("✅ Database synced");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    process.exit(1);
  }
};

module.exports = db;
