import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
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

    res.status(201).json(nuevoAgendamiento);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ [POST /agendamiento] Error:', err.message);
    res.status(500).json({ error: 'Error al registrar agendamiento', detail: err.message });
  }
});

export default router;
