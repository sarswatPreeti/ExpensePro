const { Sequelize } = require("sequelize");
require("dotenv").config();

const isProduction = process.env.NODE_ENV === "production";

// Prefer single DATABASE_URL if provided (e.g., Neon/Render), fallback to discrete env vars
const databaseUrl = process.env.DATABASE_URL;

// Minimal, safe visibility into which DB config path is used (no secrets printed)
try {
  if (databaseUrl) {
    const redacted = databaseUrl.replace(/:(?:[^:@/]+)@/, ":***@");
    console.log("🗄️ Using DATABASE_URL for Postgres:", redacted);
  } else {
    console.log(
      "🗄️ Using discrete DB vars for Postgres host=",
      process.env.DB_HOST || "<missing>",
      " db=",
      process.env.DB_NAME || "<missing>"
    );
  }
} catch (_) {}

const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, {
      dialect: "postgres",
      logging: false,
      dialectOptions: isProduction
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    })
  : new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      host: process.env.DB_HOST,
      dialect: "postgres",
      logging: false, // Optional: logs only in dev
      dialectOptions: isProduction
        ? {
            ssl: {
              require: true,
              rejectUnauthorized: false,
            },
          }
        : {},
    });

module.exports = sequelize;
