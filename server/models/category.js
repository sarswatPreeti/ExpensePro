module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define(
    "Category",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["userId", "name"],
        },
      ],
    }
  );

  Category.associate = (models) => {
    Category.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE",
    });

    Category.hasMany(models.Expense, {
      foreignKey: "categoryId",
      as: "expenses",
      onDelete: "RESTRICT",
      hooks: true,
    });
  };

  return Category;
};
