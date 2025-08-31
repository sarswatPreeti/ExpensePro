const express = require("express");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const db = require("./models");
const sequelize = require("./config/database");

// Load environment variables
dotenv.config(); 

const app = express();
// Railway uses PORT environment variable
const PORT = process.env.PORT || 3000;

// Debug port information
console.log('🔍 Port Debug:');
console.log('PORT env var:', process.env.PORT);
console.log('Using port:', PORT);
console.log('Railway PORT env var:', process.env.RAILWAY_STATIC_URL);
console.log('All env vars:', Object.keys(process.env));

// Middlewares
const allowedOrigins = [
  "http://localhost:3000",
  "https://expense-pro-six.vercel.app",
  "https://expense-gn1gz68v3-preeti-saraswats-projects.vercel.app",
  "https://expense-7ohqm3uxd-preeti-saraswats-projects.vercel.app",
  "https://expensepro-production.up.railway.app"
];

// Add any additional origins from environment variable
if (process.env.CORS_ORIGIN) {
  const envOrigins = process.env.CORS_ORIGIN.split(',').map(origin => origin.trim());
  allowedOrigins.push(...envOrigins);
}

// CORS configuration - allow all origins temporarily to fix 502 errors
app.use(cors({
  origin: true, // Allow all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
console.log('🌐 CORS: Allowing all origins to fix 502 errors');

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

// Health check route
app.get("/", (req, res) => {
  console.log('🏥 Health check request received');
  res.json({ 
    message: "Server is running!", 
    status: "healthy",
    port: PORT,
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    cors: {
      allowedOrigins: allowedOrigins,
      currentOrigin: req.headers.origin
    }
  });
});

// Test route
app.get("/api/test", (req, res) => {
  console.log('🧪 Test route request received');
  res.json({ message: "API is running!" });
});

// Simple ping route
app.get("/ping", (req, res) => {
  console.log('🏓 Ping request received');
  res.status(200).send("pong");
});

// Even simpler health check
app.get("/health", (req, res) => {
  console.log('💚 Health check received');
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    port: PORT
  });
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
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running and listening on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🔗 Server URL: http://0.0.0.0:${PORT}`);
  console.log(`🔗 Local URL: http://localhost:${PORT}`);
});

// Add error handling
server.on('error', (error) => {
  console.error('❌ Server error:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use`);
  }
});

// Add process error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize database connection (non-blocking)
(async () => {
  try {
    console.log("⏳ Initializing database connection...");
    await db.sync();
    console.log("✅ Database initialization complete");
  } catch (err) {
    console.error("❌ Database initialization error:", err);
    // Don't exit the process, let the server continue running
    // The server can still handle requests even if DB is down
  }
})();