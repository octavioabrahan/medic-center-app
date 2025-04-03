const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medico = sequelize.define('Medico', {
  id_medico: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  especialidad: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  telefono: {
    type: DataTypes.STRING,
  },
  correo_electronico: {
    type: DataTypes.STRING,
    validate: {
      isEmail: true,
    },
  },
  horario_atencion: {
    type: DataTypes.STRING,
  },
});

module.exports = Medico;
