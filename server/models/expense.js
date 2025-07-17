const { DataTypes } = require("sequelize");

{/*Sequelize model for an Expense Table*/}
module.exports = (sequelize) =>
  sequelize.define("Expense", {
    title: { type: DataTypes.STRING(100), allowNull: false },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING(255), allowNull: true }, // Optional field
    invoice: { type: DataTypes.STRING, allowNull: true,} // Optional field
  });
