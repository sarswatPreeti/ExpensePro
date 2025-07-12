const express = require("express");
const router = express.Router();
const { Expense } = require("../models");

router.get("/", async (req, res) => {
  const expenses = await Expense.findAll({ order: [["date", "DESC"]] });
  res.json(expenses);
});

router.post("/", async (req, res) => {
  const { title, amount, date, category, description } = req.body;
  const expense = await Expense.create({ title, amount, date, category, description });
  res.status(201).json(expense);
});

router.delete("/:id", async (req, res) => {
  try {
    const rowsDeleted = await Expense.destroy({ where: { id: req.params.id } });
    if (rowsDeleted) return res.status(204).send();
    res.status(404).json({ error: "Expense not found" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

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
