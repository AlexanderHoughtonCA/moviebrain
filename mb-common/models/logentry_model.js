'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LogEntry extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  LogEntry.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true
    },
    level: DataTypes.STRING,
    meta: DataTypes.STRING,
    message: DataTypes.TEXT,
    timestamp: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'LogEntry',
    tableName: 'LogEntry',
  });
  return LogEntry;
};
