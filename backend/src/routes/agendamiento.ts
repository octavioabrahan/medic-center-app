import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
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

    console.log('✅ [POST /agendamiento] Cita registrada:', nuevoAgendamiento.agendamiento_id);
    res.status(201).json(nuevoAgendamiento);
  } catch (error: any) {
    console.error('❌ [POST /agendamiento] Error:', error.message);
    res.status(500).json({ error: 'Error al registrar agendamiento', detail: error.message });
  }
});

export default router;
