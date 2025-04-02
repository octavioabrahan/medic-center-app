const Medico = require('../models/Medico');

// Obtener todos los médicos
exports.getAllMedicos = async (req, res) => {
  try {
    const medicos = await Medico.findAll();
    res.json(medicos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los médicos' });
  }
};

// Crear un nuevo médico
exports.createMedico = async (req, res) => {
  try {
    const nuevoMedico = await Medico.create(req.body);
    res.status(201).json(nuevoMedico);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el médico' });
  }
};

// Otros métodos para actualizar y eliminar médicos según sea necesario
