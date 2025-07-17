const fs = require("fs");
const path = require("path");
const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const { addExpense } = require("../controllers/expenseController");
const { Expense } = require("../models");

{/* Fetch All Expense */}
router.get("/", async (req, res) => {
  const expenses = await Expense.findAll({ order: [["date", "DESC"]] });
  res.json(expenses);
});

{/* Create a new Expense*/}
router.post("/", async (req, res) => {
  try {
    const { title, amount, date, category, description } = req.body;
    if (!title || !amount || !date || !category) {
      return res.status(400).json({ error: "Required fields missing" });
    }
    const expense = await Expense.create({ title, amount, date, category, description });
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: "Failed to create expense" });
  }
});

{/* Add Expense with single invoice */}
router.post("/add", upload.single("invoice"), addExpense);

{/* Upload invoice */}
router.put("/:id/upload-invoice", upload.single("invoice"), async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ error: "Expense not found" });

    const fileBuffer = req.file.buffer;
    const hash = getFileHash(fileBuffer);
    const invoiceDir = path.join(__dirname, "..", "uploads/invoices");

    // Check for duplicate by comparing hashes
    const files = fs.readdirSync(invoiceDir);
    for (let file of files) {
      const existingBuffer = fs.readFileSync(path.join(invoiceDir, file));
      if (getFileHash(existingBuffer) === hash) {
        return res.status(409).json({ error: "Duplicate invoice detected" });
      }
    }

    // Remove old invoice if it exists
    if (expense.invoice) {
      const oldPath = path.join(__dirname, "..", expense.invoice);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Save new invoice
    const ext = path.extname(req.file.originalname);
    const filename = `invoice-${Date.now()}${ext}`;
    const newPath = path.join(invoiceDir, filename);
    fs.writeFileSync(newPath, fileBuffer);

    expense.invoice = `uploads/invoices/${filename}`;
    await expense.save();

    res.json(expense);
  } catch (err) {
    console.error("Failed to upload and replace invoice:", err);
    res.status(500).json({ error: "Failed to upload invoice. It may be a duplicate file or a network issue. Please check and try again." });
  }
});

{/*Fetch a single expense by id*/}
router.get("/expenses/:id", async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).send("Expense not found");
    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

{/* Update Expense by id*/}
router.put("/:id", async (req, res) => {
  const { title, amount, date, category, description } = req.body;
  try {
    const [rowsUpdated] = await Expense.update(
      { title, amount, date, category, description },
      { where: { id: req.params.id } }
    );
    if (rowsUpdated) {
      const updated = await Expense.findByPk(req.params.id);
      return res.json(updated);
    }
    res.status(404).json({ error: "Expense not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to update expense" });
  }
});

module.exports = router;
