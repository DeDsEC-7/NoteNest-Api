'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // A user can have many notes
      User.hasMany(models.Note, {
        foreignKey: 'userId',
        as: 'notes',
        onDelete: 'CASCADE',
      });

      // A user can have many todos
      User.hasMany(models.Todo, {
        foreignKey: 'userId',
        as: 'todos',
        onDelete: 'CASCADE',
      });
    }
  }

  User.init(
    {
      user_id: { 
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
      },
      firstname: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      lastname: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
      email: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        unique: true, 
        validate: { isEmail: true } 
      },
      password: { 
        type: DataTypes.STRING, 
        allowNull: false 
      },
       phone: {
              type: DataTypes.STRING,
              allowNull: true
            },
            autosave: {
              type: DataTypes.BOOLEAN,
              allowNull: false,
              defaultValue: false
            },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      underscored: true,
    }
  );

  return User;
};
