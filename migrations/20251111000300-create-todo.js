'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('todos', {
     id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.DataTypes.UUIDV4, allowNull: false },
title: { type: Sequelize.STRING, allowNull: false },
completed: { type: Sequelize.BOOLEAN, defaultValue: false },
due_date: { type: Sequelize.DATE, allowNull: true },
is_archived: { type: Sequelize.BOOLEAN, defaultValue: false },
is_trash: { type: Sequelize.BOOLEAN, defaultValue: false },
is_pinned: { type: Sequelize.BOOLEAN, defaultValue: false },
user_id: {
  type: Sequelize.UUID,
  allowNull: false,
  references: { model: 'users', key: 'user_id' },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
},
created_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()'), allowNull: false },
updated_at: { type: Sequelize.DATE, defaultValue: Sequelize.literal('NOW()'), allowNull: false }

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('todos');
  }
};
