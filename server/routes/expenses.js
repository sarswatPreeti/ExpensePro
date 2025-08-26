const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/upload");
const expenseController = require("../controllers/expenseController");

// Invoice download — changed to use :id (since controller checks by id)
router.get("/download/:id", authenticateToken, expenseController.downloadInvoice);

// CRUD
router.post("/", authenticateToken, upload.single("invoice"), expenseController.createExpense);
router.get("/", authenticateToken, expenseController.getExpenses); // ✅ fixed
router.get("/:id", authenticateToken, expenseController.getExpenseById); // ✅ fixed
router.put("/:id", authenticateToken, upload.single("invoice"), expenseController.updateExpense);
router.delete("/:id", authenticateToken, expenseController.deleteExpense);

module.exports = router;
