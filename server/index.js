const express = require("express");
const cors = require("cors");
const db = require("./models");
require("dotenv").config();

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());
app.use("/api/expenses", require("./routes/expenses"));
app.use("/api/categories", require("./routes/categories"));

db.sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
