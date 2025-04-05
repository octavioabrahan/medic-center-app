const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  const {
    cedula,
    fecha_agendada,
    convenio,
    profesional_id,
    especialidad_id,
    tipo_atencion_id
  } = req.body;

  if (
    !cedula ||
    !fecha_agendada ||
    typeof convenio === 'undefined' ||
    !profesional_id ||
    !especialidad_id ||
    !tipo_atencion_id
  ) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const nuevoAgendamiento = await prisma.agendamiento.create({
      data: {
        cedula,
        fecha_agendada: new Date(fecha_agendada),
        convenio,
        profesional_id,
        especialidad_id,
        tipo_atencion_id
      }
    });

    console.log('✅ [POST /agendamiento] Agendado:', nuevoAgendamiento.agendamiento_id);
    res.status(201).json(nuevoAgendamiento);
  } catch (error) {
    console.error('❌ [POST /agendamiento] Error:', error.message);
    res.status(500).json({ error: 'Error al registrar agendamiento', detail: error.message });
  }
});

module.exports = router;
