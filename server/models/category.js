// module.exports = (sequelize, DataTypes) => {
//   const Category = sequelize.define("Category", {
//     name: {
//       type: DataTypes.STRING,
//       unique: true,
//       allowNull: false,
//     },
//   });
//   return Category;
// };


module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: "user_category_unique", // Ensures user cannot add duplicate category names
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: "user_category_unique", // Composite unique constraint with name
    },
  });

  Category.associate = (models) => {
    Category.belongsTo(models.User, {
      foreignKey: "userId",
      as: "user",
      onDelete: "CASCADE", // If user is deleted, delete their categories
    });

    Category.hasMany(models.Expense, {
      foreignKey: "categoryId",
      as: "expenses",
      onDelete: "RESTRICT", // Prevent deleting category if used in expenses
    });
  };

  return Category;
};
