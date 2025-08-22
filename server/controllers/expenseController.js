const { Expense, Category } = require("../models");
const path = require("path");
const fs = require("fs");

const INVOICE_DIR = path.resolve(process.cwd(), "uploads", "invoices");

// Create expense
exports.createExpense = async (req, res) => {
  try {
    let { title, amount, date, category: categoryName, paymentMethod, cardLast4, description } = req.body;
    const userId = req.user.id;

    if (!title || !amount || !date || !categoryName) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Normalize category name
    categoryName = categoryName.trim().toLowerCase();

    const parsedAmount = parseFloat(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // Validate card payments
    if ((paymentMethod === "Credit Card" || paymentMethod === "Debit Card") &&
        (!cardLast4 || !/^\d{4}$/.test(cardLast4))) {
      return res.status(400).json({ message: "cardLast4 must be 4 digits for card payments" });
    }

    const [category] = await Category.findOrCreate({
      where: { name: categoryName, userId },
      defaults: { name: categoryName, userId },
    });

    let invoiceFilename = req.file ? req.file.filename : null;

    const expense = await Expense.create({
      title,
      amount: parsedAmount,
      date,
      categoryId: category.id,
      paymentMethod: paymentMethod || "Cash",
      cardLast4: cardLast4 || null,
      description,
      invoice: invoiceFilename,
      userId,
    });

    return res.status(201).json(expense);

  } catch (error) {
    console.error("Error creating expense:", error);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// Get all expenses
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      where: { userId: req.user.id },
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
      order: [["date", "DESC"]],
    });
    return res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
};

// Get single expense
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
      include: [{ model: Category, as: "category", attributes: ["id", "name"] }],
    });

    if (!expense) return res.status(404).json({ message: "Expense not found" });
    return res.status(200).json(expense);
  } catch (error) {
    console.error("Error fetching expense:", error);
    return res.status(500).json({ message: "Failed to fetch expense", error: error.message });
  }
};

// Update expense
exports.updateExpense = async (req, res) => {
  try {
    let { amount, description, date, categoryId, paymentMethod, cardLast4 } = req.body;

    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    if (categoryId) {
      const category = await Category.findOne({
        where: { id: categoryId, userId: req.user.id },
      });
      if (!category) return res.status(400).json({ message: "Invalid category" });
    }

    // Validate card payments
    if ((paymentMethod === "Credit Card" || paymentMethod === "Debit Card") &&
        (!cardLast4 || !/^\d{4}$/.test(cardLast4))) {
      return res.status(400).json({ message: "cardLast4 must be 4 digits for card payments" });
    }

    if (req.file) {
      if (expense.invoice) {
        const oldPath = path.join(INVOICE_DIR, expense.invoice);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      expense.invoice = req.file.filename;
    }

    expense.amount = amount || expense.amount;
    expense.description = description || expense.description;
    expense.date = date || expense.date;
    expense.categoryId = categoryId || expense.categoryId;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;
    expense.cardLast4 = cardLast4 || expense.cardLast4;

    await expense.save();
    return res.status(200).json(expense);
  } catch (error) {
    console.error("Error updating expense:", error);
    return res.status(500).json({ message: "Failed to update expense", error: error.message });
  }
};

// Delete expense
exports.deleteExpense = async (req, res) => {
  try {
    console.log("Delete expense request received for ID:", req.params.id);
    console.log("User ID:", req.user.id);
    
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    
    console.log("Found expense:", expense ? "Yes" : "No");
    
    if (!expense) {
      console.log("Expense not found or doesn't belong to user");
      return res.status(404).json({ message: "Expense not found" });
    }

    if (expense.invoice) {
      const filePath = path.join(INVOICE_DIR, expense.invoice);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log("Invoice file deleted:", expense.invoice);
      }
    }

    await expense.destroy();
    console.log("Expense deleted successfully from database");
    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
};

// Download invoice
exports.downloadInvoice = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });
    if (!expense || !expense.invoice) return res.status(404).json({ message: "Invoice not found" });

    const filePath = path.join(INVOICE_DIR, expense.invoice);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: "Invoice file not found" });

    return res.download(filePath, expense.invoice);
  } catch (error) {
    console.error("Error downloading invoice:", error);
    return res.status(500).json({ message: "Failed to download invoice", error: error.message });
  }
};
