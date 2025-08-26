const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Expense, {
        foreignKey: "userId",
        as: "expenses",
        onDelete: "CASCADE",
        hooks: true,
      });

      User.hasMany(models.Category, {
        foreignKey: "userId",
        as: "categories",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }

  User.init(
    {
      firebaseUid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: { len: [6, 100] },
      },
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "Users",
      indexes: [
        { unique: true, fields: ["firebaseUid"] },
        { unique: true, fields: ["email"] },
      ],
    }
  );

  return User;
};
