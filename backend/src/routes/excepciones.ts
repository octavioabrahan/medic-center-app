import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    console.error('❌ [POST /horario/excepcion] Error:', error.message);
    res.status(500).json({ error: 'No se pudo registrar la excepción', detail: error.message });
  }
});


export default router;
