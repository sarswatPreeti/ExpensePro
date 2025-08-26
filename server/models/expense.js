module.exports = (sequelize, DataTypes) => {
  const Expense = sequelize.define("Expense", {
    title: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: { min: 0 },
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
      type: DataTypes.STRING,
      allowNull: true,
    },
    paymentMethod: {
      type: DataTypes.ENUM(
        "Cash",
        "Paytm",
        "Debit Card",
        "GPay",
        "PhonePe",
        "Credit Card"
      ),
      allowNull: false,
      defaultValue: "Cash",
    },
    cardLast4: {
      type: DataTypes.STRING(4),
      allowNull: true,
      validate: { isNumeric: true, len: [4, 4] },
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
      as: "user",
      onDelete: "CASCADE",
      hooks: true,
    });

    Expense.belongsTo(models.Category, {
      foreignKey: "categoryId",
      as: "category",
      onDelete: "RESTRICT",
      hooks: true,
    });
  };

  return Expense;
};
