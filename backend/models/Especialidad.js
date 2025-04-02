const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Especialidad = sequelize.define('Especialidad', {
  id_especialidad: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  descripcion: {
    type: DataTypes.TEXT,
  },
});

module.exports = Especialidad;
