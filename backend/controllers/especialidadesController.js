const Especialidad = require('../models/Especialidad');

// Obtener todas las especialidades
exports.getAllEspecialidades = async (req, res) => {
  try {
    const especialidades = await Especialidad.findAll();
    res.json(especialidades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las especialidades' });
  }
};

// Crear una nueva especialidad
exports.createEspecialidad = async (req, res) => {
  try {
    const nuevaEspecialidad = await Especialidad.create(req.body);
    res.status(201).json(nuevaEspecialidad);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la especialidad' });
  }
};

// Otros métodos para actualizar y eliminar especialidades según sea necesario
