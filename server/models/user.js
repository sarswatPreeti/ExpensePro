// Importing the base Model class from Sequelize
const { Model } = require("sequelize");

// Exporting the User model definition function
module.exports = (sequelize, DataTypes) => {

  // Defining the User model by extending Sequelize's Model class
  class User extends Model {

    /**
     * Associate method sets up model relationships.
     * This is called automatically in the `models/index.js` file.
     */
    static associate(models) {
      User.hasMany(models.Expense, {
        foreignKey: "userId", // 'userId' field in Expense model
        as: "expenses", // Alias for the relationship
        onDelete: "CASCADE", // Delete all expenses if user is deleted
      });

      // A user can have many categories
      User.hasMany(models.Category, {
        foreignKey: "userId", // 'userId' field in Category model
        as: "categories", // Alias for the relationship
        onDelete: "CASCADE", // Delete all categories if user is deleted
      });
    }
  }

  // Initializing the User model's attributes (columns)
  User.init(
    {
      // Firebase UID for uniquely identifying users via Firebase Auth
      firebaseUid: {
        type: DataTypes.STRING,
        allowNull: false, // Must be present
        unique: true, // Must be unique
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true, // Validates correct email format
        },
      },

      // Password is optional because we support Firebase sign-in methods
      password: {
        type: DataTypes.STRING,
        allowNull: true,  // Can be null for Firebase-only users
        validate: {
          len: [6, 100], // If present, must be between 6–100 chars
        },
      },

      // URL/path to the user's profile image (optional)
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize, // Pass Sequelize instance
      modelName: "User", // Model name used internally by Sequelize
      tableName: "Users", // Actual table name in the database
    }
  );

  // Return the defined model
  return User;
};
