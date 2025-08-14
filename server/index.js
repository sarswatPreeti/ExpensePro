// const express = require("express");
// const cors = require("cors");
// const db = require("./models");
// require("dotenv").config(); // Loads environment variables from a .env file into process.env
// const path = require("path");
// const sequelize = require("./config/database");
// const User = require("./models/user");

// const app = express();
// const PORT = 4000;
// const downloadRoutes = require("./routes/expenses"); 

// // Enables Cross-Origin Resource Sharing so frontend apps on other origins can access this API
// app.use(cors());

// // Parses incoming JSON requests and makes the data available under req.body
// app.use(express.json());

// // Serves static files (like invoices) from the 'uploads' folder at the '/uploads' path
// app.use("/uploads", express.static("uploads"));

// // Mounts all expense-related routes at '/api/expenses'
// app.use("/api/expenses", require("./routes/expenses"));

//  // Mounts all category-related routes at '/api/categories'
// app.use("/api/categories", require("./routes/categories"));

// app.use("/api", downloadRoutes);

// const sequelize = require("./config/database");
// sequelize.authenticate()
//   .then(() => console.log("PostgreSQL connected"))
//   .catch((err) => console.log("DB connection error:", err));

// app.use("/api/auth", require("./routes/auth"));

// // Syncs the database models and starts the server after successful sync
// db.sequelize.sync().then(() => {
//   app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
// });


const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const db = require("./models");
const sequelize = require("./config/database");

dotenv.config(); // Load environment variables

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors({
  origin: "http://localhost:3000", // or your frontend domain
  credentials: true
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Serve static files (e.g. uploaded invoices)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/profile", require("./routes/profile"));

// Test DB connection
sequelize.authenticate()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err) => console.error("❌ DB connection error:", err));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "API route not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

// Sync DB and start server
db.sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  });
});
