// controllers/categoryController.js

const { Category, Expense } = require("../models");

// Get all categories for the logged-in user
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Expense,
          as: "expenses",
          attributes: ["id", "title", "amount", "date", "description"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    res.json(categories);
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).json({ message: "Failed to fetch categories." });
  }
};

// Add a new category
exports.addCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ message: "Category name is required." });
  }

  try {
    const existing = await Category.findOne({
      where: { name, userId: req.user.id },
    });

    if (existing) {
      return res.status(400).json({ message: "Category already exists." });
    }

    const newCategory = await Category.create({
      name,
      userId: req.user.id,
    });

    res.status(201).json({ message: "Category added successfully.", category: newCategory });
  } catch (err) {
    res.status(500).json({ message: "Failed to add category." });
  }
};

// Delete a category if not used
exports.deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await Category.findOne({
      where: { id: categoryId, userId: req.user.id },
    });

    if (!category) {
      return res.status(404).json({ message: "Category not found or unauthorized." });
    }

    const usedInExpense = await Expense.findOne({
      where: { categoryId, userId: req.user.id },
    });

    if (usedInExpense) {
      return res.status(400).json({ message: "Category is used in an expense and cannot be deleted." });
    }

    await category.destroy();
    res.json({ message: "Category deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category." });
  }
};