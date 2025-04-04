import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      cedula,
      nombre,
      apellido,
      email,
      telefono,
      fecha_agendada,
      convenio,
      profesional_id,
      tipo_atencion_id
    } = req.body;

    // Guardar paciente si no existe
    await prisma.persona.upsert({
      where: { cedula },
      update: { nombre, apellido, email, telefono },
      create: { cedula, nombre, apellido, email, telefono }
    });

    const cita = await prisma.agendamiento.create({
      data: {
        cedula,
        fecha_agendada: new Date(fecha_agendada),
        convenio,
        profesional_id,
        tipo_atencion_id
      }
    });

    res.status(201).json(cita);
  } catch (error) {
    console.error('[POST /agendamiento]', error);
    res.status(500).json({ error: 'Error al registrar agendamiento' });
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
