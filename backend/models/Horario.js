const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Horario = sequelize.define('Horario', {
  id_horario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  id_medico: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Medicos',
      key: 'id_medico',
    },
  },
  dia_semana: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  hora_inicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  hora_fin: {
    type: DataTypes.TIME,
    allowNull: false,
  },
});

module.exports = Horario;
