const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const { profesional_id, fecha, estado } = req.body;

  if (!profesional_id || !fecha || !estado) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const excepcion = await prisma.horarioExcepcion.create({
      data: {
        profesional_id,
        fecha: new Date(fecha),
        estado
      }
    });

    console.log('✅ [POST /horario/excepcion] Excepción creada:', excepcion.excepcion_id);
    res.status(201).json(excepcion);
  } catch (error) {
    console.error('❌ [POST /horario/excepcion] Error:', error.message);
    res.status(500).json({ error: 'No se pudo registrar la excepción', detail: error.message });
  }
});

module.exports = router;
