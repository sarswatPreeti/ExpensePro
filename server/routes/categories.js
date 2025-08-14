// // server/routes/categories.js

// const express = require("express");
// const router = express.Router();
// const { Category } = require("../models"); // Adjust based on your DB setup

// // Add a new category
// router.post("/", async (req, res) => {
//   const { name } = req.body;
//   if (!name) return res.status(400).json({ error: "Category name required" });

//   try {
//     // Check if it already exists
//     const existing = await Category.findOne({ where: { name } });
//     if (existing) return res.status(409).json({ error: "Category already exists" });

//     const newCategory = await Category.create({ name });
//     res.status(201).json(newCategory);
//   } catch (err) {
//     console.error("Failed to create category:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // GET: Get all categories
// router.get("/", async (req, res) => {
//   try {
//     const categories = await Category.findAll();
//     res.json(categories);
//   } catch (err) {
//     console.error("Failed to fetch categories:", err);
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // Delete category by ID
// router.delete('/:id', async (req, res) => {
//   const categoryId = req.params.id;

//   try {
//     const category = await Category.findByPk(categoryId);
//     if (!category) return res.status(404).json({ message: 'Category not found' });

//     const categoryName = category.name;

//     // Check if any expense uses this category
//     const used = await Expense.findOne({ where: { category: categoryName } });
//     if (used) {
//       return res.status(400).json({ message: 'Category is in use and cannot be deleted' });
//     }

//     await category.destroy();
//     res.json({ message: 'Category deleted successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const {authenticateToken} = require("../middlewares/authMiddleware");
const categoryController = require("../controllers/categoryController");

router.get("/", authenticateToken, categoryController.getAllCategories);
router.post("/add", authenticateToken, categoryController.addCategory);
router.delete("/:id", authenticateToken, categoryController.deleteCategory);

module.exports = router;
