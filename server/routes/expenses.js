const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const expenseController = require("../controllers/expenseController");

router.get("/download/:filename", authenticateToken, expenseController.downloadInvoice);

router.post("/", authenticateToken, upload.single("invoice"), expenseController.createExpense);
router.get("/", authenticateToken, expenseController.getAllExpenses);
router.get("/:id", authenticateToken, expenseController.getExpense);
router.put("/:id", authenticateToken, upload.single("invoice"), expenseController.updateExpense);
router.delete("/:id", authenticateToken, expenseController.deleteExpense);

module.exports = router;
