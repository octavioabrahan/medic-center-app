import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Lista todos los profesionales con datos de persona y especialidad
router.get('/', async (_req: Request, res: Response) => {
  try {
    const profesionales = await prisma.profesional.findMany({
      include: {
        persona: true,
        especialidad: true
      }
    });
    res.json(profesionales);
  } catch (error) {
    console.error('[GET /profesionales] ❌', error);
    res.status(500).json({ error: 'Error al obtener profesionales', detail: error });
  }
});

export default router;