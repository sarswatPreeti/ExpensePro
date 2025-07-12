module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define("Category", {
    name: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
  });
  return Category;
};
