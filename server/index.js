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

// // Sync DB and start server
// db.sequelize.sync().then(() => {
//   app.listen(PORT, () => {
//     console.log(`🚀 Server running at http://localhost:${PORT}`);
//     console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
//   });
// });

// Connect & sync DB, then start server
(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    // Do NOT drop tables on every start. Use FORCE_SYNC=true only when intentionally resetting.
    const shouldForceSync = process.env.FORCE_SYNC === "true";
    await db.sequelize.sync({ force: shouldForceSync });
    // console.log(`✅ Database synced successfully! force=${shouldForceSync}`);

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("❌ DB connection or sync error:", err);
  }
})();