'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Note extends Model {
    static associate(models) {
      Note.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  Note.init({
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    title: { type: DataTypes.STRING, allowNull: false },
    content: { type: DataTypes.TEXT, allowNull: true },
    isArchived: { type: DataTypes.BOOLEAN, defaultValue: false },
    isTrash: { type: DataTypes.BOOLEAN, defaultValue: false },
     isPinned: { type: DataTypes.BOOLEAN, defaultValue: false },
    userId: { type: DataTypes.UUID, allowNull: false }
  }, {
    sequelize,
    modelName: 'Note',
    tableName: 'notes',
    timestamps: true,
    underscored: true
  });

  return Note;
};
