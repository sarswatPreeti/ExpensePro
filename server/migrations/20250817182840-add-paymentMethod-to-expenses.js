"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Expenses", "paymentMethod", {
      type: Sequelize.ENUM("Cash", "Paytm", "Debit Card", "GPay", "PhonePe","Credit Card"),
      allowNull: false,
      defaultValue: "Cash",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Expenses", "paymentMethod");
  },
};
