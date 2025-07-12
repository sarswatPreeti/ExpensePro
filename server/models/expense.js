const { DataTypes } = require("sequelize");

module.exports = (sequelize) =>
  sequelize.define("Expense", {
    title: { type: DataTypes.STRING, allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true }, // Optional field
  });
