const Horario = require('../models/Horario');

// Obtener horarios por ID de médico
exports.getHorariosByMedico = async (req, res) => {
  try {
    const { id_medico } = req.params;
    const horarios = await Horario.findAll({ where: { id_medico } });
    res.json(horarios);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los horarios' });
  }
};

// Crear un nuevo horario
exports.createHorario = async (req, res) => {
  try {
    const nuevoHorario = await Horario.create(req.body);
    res.status(201).json(nuevoHorario);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el horario' });
  }
};

// Otros métodos para actualizar y eliminar horarios según sea necesario
