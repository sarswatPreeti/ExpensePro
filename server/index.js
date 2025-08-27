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
const allowedOrigins = [
  "http://localhost:3000",
  "http://expense-pro-six.vercel.app",
  "https://expense-gn1gz68v3-preeti-saraswats-projects.vercel.app",
  "https://expense-7ohqm3uxd-preeti-saraswats-projects.vercel.app"
];

// Add any additional origins from environment variable
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Handle preflight requests explicitly
app.options('*', cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Serve static files (e.g. uploaded invoices)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/profile", require("./routes/profile"));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "API is running!" });
});

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