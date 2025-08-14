// require('dotenv').config();

// module.exports = {
//   development: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: 'postgres',
//   },
//   test: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: 'postgres',
//   },
//   production: {
//     username: process.env.DB_USER,
//     password: process.env.DB_PASS,
//     database: process.env.DB_NAME,
//     host: process.env.DB_HOST,
//     dialect: 'postgres',
//   },
// };


require("dotenv").config();

const commonConfig = {
  dialect: "postgres",
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false, // Disable logging by default
};

module.exports = {
  development: {
    ...commonConfig,
    database: process.env.DB_NAME,
    logging: console.log, // Enable verbose logging only in dev
  },
  test: {
    ...commonConfig,
    database: process.env.TEST_DB_NAME || process.env.DB_NAME,
  },
  production: {
    ...commonConfig,
    database: process.env.DB_NAME,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false, // Use with Heroku-like environments
      },
    },
  },
};
