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

// Safe sync - no alter:true in production
db.sync = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    // In production, don't alter tables - just verify connection
    if (process.env.NODE_ENV === 'production') {
      console.log("✅ Database connection verified (production mode)");
    } else {
      await sequelize.sync({ alter: true }); // Only in development
      console.log("✅ Database synced");
    }
  } catch (error) {
    console.error("❌ Error syncing database:", error);
    // Don't exit process, let the main index.js handle it
  }
};

module.exports = db;