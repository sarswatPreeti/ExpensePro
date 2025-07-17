const { Expense } = require("../models");
const fs = require("fs");
const path = require("path");

{/*Create a new expense with optional invoice upload support*/}
const addExpense = async (req, res) => {
  try {
    const { title, amount, category, description, date } = req.body;

    // Check if required fields are missing and return error if so
    if (!title || !amount || !category || !date) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let invoicePath = null;

    if (req.file) {
      // Define invoice directory
      const invoiceDir = path.join(__dirname, "..", "uploads/invoices");

      // Create directory if not exists
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      // Generate unique file name
      const ext = path.extname(req.file.originalname);
      const filename = `invoice-${Date.now()}${ext}`;
      const fullPath = path.join(invoiceDir, filename);

      // Save file from memory to disk
      fs.writeFileSync(fullPath, req.file.buffer);

      // Save relative path to DB
      invoicePath = `uploads/invoices/${filename}`;
    }

    // Create expense with invoice path (if any)
    const expense = await Expense.create({
      title,
      amount,
      category,
      description,
      date,
      invoice: invoicePath,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

module.exports = { addExpense };