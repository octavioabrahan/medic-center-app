import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const data = await prisma.tipoAtencion.findMany();
    res.json(data);
  } catch (error) {
    console.error('[GET /tipo-atencion]', error);
    res.status(500).json({ error: 'Error al obtener tipos de atención' });
  }
});

export default router;
