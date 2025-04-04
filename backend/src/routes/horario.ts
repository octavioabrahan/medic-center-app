import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { profesional_id, dia_semana, hora_inicio, hora_termino, valido_desde, valido_hasta } = req.body;

    const horario = await prisma.horarioMedico.create({
      data: {
        profesional_id,
        dia_semana,
        hora_inicio,
        hora_termino,
        valido_desde: new Date(valido_desde),
        valido_hasta: new Date(valido_hasta)
      }
    });

    res.status(201).json(horario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar horario médico' });
  }
});

export default router;