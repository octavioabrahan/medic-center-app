import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
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

  try {
    const nuevaCita = await prisma.agendamiento.create({
      data: {
        cedula,
        fecha_agendada: new Date(fecha_agendada),
        convenio,
        profesional_id,
        especialidad_id,
        tipo_atencion_id
      }
    });

    res.status(201).json(nuevaCita);
  } catch (error: any) {
    console.error('❌ [POST /agendamiento] Error:', error.message);
    res.status(500).json({ error: 'No se pudo agendar la cita', detail: error.message });
  }
});

router.get('/', async (_req: Request, res: Response) => {
  try {
    const agendamientos = await prisma.agendamiento.findMany({
      include: {
        paciente: true,
        profesional: {
          include: {
            persona: true,
            especialidad: true
          }
        },
        tipo_atencion: true
      }
    });

    res.json(agendamientos);
  } catch (error) {
    console.error('[GET /agendamiento]', error);
    res.status(500).json({ error: 'Error al obtener agendamientos' });
  }
});

export default router;
