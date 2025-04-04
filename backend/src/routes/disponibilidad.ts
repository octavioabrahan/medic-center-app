import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (req: Request, res: Response) => {
  const { fecha } = req.query;

  if (!fecha) {
    res.status(400).json({ error: 'Falta el parámetro "fecha"' });
    return;
  }

  try {
    const date = new Date(fecha as string);
    const diaSemana = date.getDay(); // Domingo = 0, Lunes = 1, ...
    const dia = diaSemana === 0 ? 7 : diaSemana; // Ajustar a 1–7 como en tu base

    const horariosBase = await prisma.horarioMedico.findMany({
      where: {
        dia_semana: dia,
        valido_desde: { lte: date },
        valido_hasta: { gte: date }
      },
      include: {
        profesional: {
          include: {
            persona: true,
            especialidad: true
          }
        }
      }
    });

    const disponibles = [];

    for (const horario of horariosBase) {
      const excepcion = await prisma.horarioExcepcion.findFirst({
        where: {
          profesional_id: horario.profesional_id,
          fecha: date,
          estado: 'inhabilitado'
        }
      });

      if (!excepcion) {
        disponibles.push({
          profesional_id: horario.profesional_id,
          nombre: horario.profesional.persona.nombre,
          apellido: horario.profesional.persona.apellido,
          especialidad: horario.profesional.especialidad.nombre,
          hora_inicio: horario.hora_inicio,
          hora_termino: horario.hora_termino
        });
      }
    }

    res.json(disponibles);
  } catch (error) {
    console.error('[ERROR /disponibilidad]:', error);
    res.status(500).json({ error: 'Error al consultar disponibilidad' });
  }
});

export default router;
