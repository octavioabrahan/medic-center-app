import express, { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const excepcionRouter: Router = express.Router();

excepcionRouter.post('/', async (req: Request, res: Response) => {
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

    res.status(201).json(excepcion);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('❌ [POST /horario/excepcion] Error:', err.message);
    res.status(500).json({ error: 'No se pudo registrar la excepción', detail: err.message });
  }
});

export default excepcionRouter;
