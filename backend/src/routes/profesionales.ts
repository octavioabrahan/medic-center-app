import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Lista todos los profesionales con datos de persona y especialidad
router.get('/', async (_req: Request, res: Response) => {
  console.log('[GET /profesionales] 🔍 Consultando profesionales...');
  try {
    const profesionales = await prisma.profesional.findMany({
      include: {
        persona: true,
        especialidad: true
      }
    });
    console.log('[GET /profesionales] ✅ Resultado:', profesionales.length, 'resultados');
    res.json(profesionales);
  } catch (error) {
    console.error('[GET /profesionales] ❌ ERROR:', error);

    // PrismaClientKnownRequestError
    if (error.code) {
      console.error('→ Prisma error code:', error.code);
    }

    if (error instanceof Error) {
      console.error('→ Prisma error message:', error.message);
    }

    res.status(500).json({ error: 'Error al obtener profesionales' });
  } 
});


export default router;