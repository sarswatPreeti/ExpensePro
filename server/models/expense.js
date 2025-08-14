// const { DataTypes } = require("sequelize");

// {/*Sequelize model for an Expense Table*/}
// module.exports = (sequelize) =>
//   sequelize.define("Expense", {
//     title: { type: DataTypes.STRING(100), allowNull: false },
//     amount: { type: DataTypes.FLOAT, allowNull: false },
//     date: { type: DataTypes.DATEONLY, allowNull: false },
//     category: { type: DataTypes.STRING, allowNull: false },
//     description: { type: DataTypes.STRING(255), allowNull: true }, // Optional field
//     invoice: { type: DataTypes.STRING, allowNull: true,} // Optional field
//   });

module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define("Expense", {
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    invoice: {
      type: DataTypes.STRING, // Can store filename or file URL
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Expense.associate = (models) => {
    Expense.belongsTo(models.User, {
      foreignKey: "userId",
      onDelete: "CASCADE", // Delete expenses if user is deleted
    });

    Expense.belongsTo(models.Category, {
      foreignKey: "categoryId",
      onDelete: "RESTRICT", // Prevent deleting a category that's in use
    });
  };

  return Expense;
};
