const express = require("express");
const cors = require("cors");
const db = require("./models");
require("dotenv").config(); // Loads environment variables from a .env file into process.env

const app = express();
const PORT = 4000;

// Enables Cross-Origin Resource Sharing so frontend apps on other origins can access this API
app.use(cors());

// Parses incoming JSON requests and makes the data available under req.body
app.use(express.json());

// Serves static files (like invoices) from the 'uploads' folder at the '/uploads' path
app.use("/uploads", express.static("uploads"));

// Mounts all expense-related routes at '/api/expenses'
app.use("/api/expenses", require("./routes/expenses"));

 // Mounts all category-related routes at '/api/categories'
app.use("/api/categories", require("./routes/categories"));

// Syncs the database models and starts the server after successful sync
db.sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
