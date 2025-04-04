import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { profesional_id, fecha, estado, hora_inicio, hora_termino, motivo } = req.body;

    const excepcion = await prisma.horarioExcepcion.create({
      data: {
        profesional_id,
        fecha: new Date(fecha),
        estado,
        hora_inicio,
        hora_termino,
        motivo
      }
    });

    res.status(201).json(excepcion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al registrar excepción' });
  }
});

export default router;
