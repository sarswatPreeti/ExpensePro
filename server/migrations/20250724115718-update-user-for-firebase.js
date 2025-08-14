'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Change password to allow NULL
    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Add firebaseUid column if it doesn't exist
    const table = await queryInterface.describeTable('Users');
    if (!table.firebaseUid) {
      await queryInterface.addColumn('Users', 'firebaseUid', {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Revert password to NOT NULL (if desired)
    await queryInterface.changeColumn('Users', 'password', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Remove firebaseUid column
    await queryInterface.removeColumn('Users', 'firebaseUid');
  },
};
