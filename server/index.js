const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const db = require("./models");
const sequelize = require("./config/database");

// Load environment variables
dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
const allowedOrigins = [
  "http://localhost:3000",
  "https://expense-gn1gz68v3-preeti-saraswats-projects.vercel.app",
  "https://expense-7ohqm3uxd-preeti-saraswats-projects.vercel.app"
];

// Add any additional origins from environment variable
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

// Temporary: Allow all origins for debugging (REMOVE IN PRODUCTION)
const isDevelopment = process.env.NODE_ENV !== 'production';
if (isDevelopment || process.env.ALLOW_ALL_ORIGINS === 'true') {
  app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  console.log('🚨 CORS: Allowing ALL origins (development mode)');
} else {
  app.use(cors({
    origin: function (origin, callback) {
      console.log('CORS Origin check:', origin);
      console.log('Allowed origins:', allowedOrigins);
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
}

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

// Start HTTP server immediately so health routes respond even if DB is booting
app.listen(PORT, () => {
  console.log(`🚀 Server running and listening on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

// Connect & sync DB in background (non-blocking)
(async () => {
  try {
    console.log("⏳ Attempting to connect to PostgreSQL...");
    await db.sequelize.authenticate();
    console.log("✅ PostgreSQL connected");

    const shouldForceSync = process.env.FORCE_SYNC === "true";
    if (shouldForceSync) {
      console.warn("⚠️ FORCE_SYNC is enabled. This will drop and recreate tables.");
    }
    await db.sequelize.sync({ force: shouldForceSync });
    console.log(`✅ Database synced successfully (force=${shouldForceSync})`);
  } catch (err) {
    console.error("❌ DB connection or sync error:", err);
  }
})();