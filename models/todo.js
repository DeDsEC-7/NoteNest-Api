'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Todo extends Model {
    static associate(models) {
      Todo.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Todo.hasMany(models.Task, { foreignKey: 'todoId', as: 'tasks', onDelete: 'CASCADE' });
    }
  }

  Todo.init({
  id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
  title: { type: DataTypes.STRING, allowNull: false },
  completed: { type: DataTypes.BOOLEAN, defaultValue: false },
  due_date: { type: DataTypes.DATE, allowNull: true },
  isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
  isTrash: { type: DataTypes.BOOLEAN, defaultValue: false },
  isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
  userId: { type: DataTypes.UUID, allowNull: false },
}, {
  sequelize,
  modelName: 'Todo',
  tableName: 'todos',
  timestamps: true,
  underscored: true
});


  return Todo;
};
