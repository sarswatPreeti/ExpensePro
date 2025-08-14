// const { Expense } = require("../models");
// const fs = require("fs");
// const path = require("path");

// {/*Create a new expense with optional invoice upload support*/}
// const addExpense = async (req, res) => {
//   try {
//     const { title, amount, category, description, date } = req.body;

//     // Check if required fields are missing and return error if so
//     if (!title || !amount || !category || !date) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     let invoicePath = null;

//     if (req.file) {
//       // Define invoice directory
//       const invoiceDir = path.join(__dirname, "..", "uploads/invoices");

//       // Create directory if not exists
//       if (!fs.existsSync(invoiceDir)) {
//         fs.mkdirSync(invoiceDir, { recursive: true });
//       }

//       // Generate unique file name
//       const ext = path.extname(req.file.originalname);
//       const filename = `invoice-${Date.now()}${ext}`;
//       const fullPath = path.join(invoiceDir, filename);

//       // Save file from memory to disk
//       fs.writeFileSync(fullPath, req.file.buffer);

//       // Save relative path to DB
//       invoicePath = `uploads/invoices/${filename}`;
//     }

//     // Create expense with invoice path (if any)
//     const expense = await Expense.create({
//       title,
//       amount,
//       category,
//       description,
//       date,
//       invoice: invoicePath,
//     });

//     res.status(201).json({ success: true, data: expense });
//   } catch (error) {
//     console.error("Error adding expense:", error);
//     res.status(500).json({ success: false, error: "Server error" });
//   }
// };

// module.exports = { addExpense };


const { Expense, Category } = require("../models");
const fs = require("fs");
const path = require("path");

// Save invoice file
const saveInvoiceFile = async (file) => {
  const invoiceDir = path.join(__dirname, "..", "uploads/invoices");
  await fs.promises.mkdir(invoiceDir, { recursive: true });

  const ext = path.extname(file.originalname);
  const filename = `invoice-${Date.now()}${ext}`;
  const fullPath = path.join(invoiceDir, filename);

  await fs.promises.writeFile(fullPath, file.buffer);
  return `uploads/invoices/${filename}`;
};

exports.createExpense = async (req, res) => {
  try {
    const { title, amount, description, date, category } = req.body;

    if (!title || !amount || !date || !category) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const foundCategory = await Category.findOne({
      where: { name: category, userId: req.user.id },
    });

    if (!foundCategory) {
      return res.status(400).json({ error: "Invalid category" });
    }

    let invoicePath = null;
    if (req.file) {
      invoicePath = await saveInvoiceFile(req.file);
    }

    const expense = await Expense.create({
      title,
      amount,
      description,
      date,
      invoice: invoicePath,
      userId: req.user.id,
      categoryId: foundCategory.id,
    });

    res.status(201).json({ success: true, data: expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({ where: { userId: req.user.id } });
    res.status(200).json({ success: true, data: expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.getExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    res.status(200).json({ success: true, data: expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { title, amount, description, date, category } = req.body;

    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!expense) return res.status(404).json({ error: "Expense not found" });

    const foundCategory = await Category.findOne({
      where: { name: category, userId: req.user.id },
    });

    if (!foundCategory) return res.status(400).json({ error: "Invalid category" });

    if (req.file) {
      // Delete old invoice
      if (expense.invoice) {
        const oldPath = path.join(__dirname, "..", expense.invoice);
        if (fs.existsSync(oldPath)) {
          await fs.promises.unlink(oldPath);
        }
      }
      expense.invoice = await saveInvoiceFile(req.file);
    }

    Object.assign(expense, {
      title,
      amount,
      description,
      date,
      categoryId: foundCategory.id,
    });

    await expense.save();
    res.status(200).json({ success: true, data: expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!expense) return res.status(404).json({ error: "Expense not found" });

    if (expense.invoice) {
      const invoicePath = path.join(__dirname, "..", expense.invoice);
      if (fs.existsSync(invoicePath)) {
        await fs.promises.unlink(invoicePath);
      }
    }

    await expense.destroy();
    res.status(200).json({ success: true, message: "Expense deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.downloadInvoice = (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, "..", "uploads", "invoices", filename);

  const isSafePath = /^[a-zA-Z0-9\-_.]+\.(pdf|jpg|jpeg|png)$/;
  if (!isSafePath.test(filename)) {
    return res.status(400).json({ error: "Invalid file name" });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath);
};
