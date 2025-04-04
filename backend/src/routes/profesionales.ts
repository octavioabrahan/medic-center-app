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
  router.post('/', async (req: Request, res: Response) => {
    const { cedula, nombre, apellido, telefono, email, especialidad_id } = req.body;
    console.log('[POST /profesionales] ➕ Intentando crear profesional:', cedula);
  
    try {
      const persona = await prisma.persona.upsert({
        where: { cedula },
        update: { nombre, apellido, telefono, email },
        create: { cedula, nombre, apellido, telefono, email }
      });
  
      const profesional = await prisma.profesional.upsert({
        where: { cedula },
        update: {},
        create: { cedula, especialidad_id }
      });
  
      console.log('[POST /profesionales] ✅ Profesional creado:', profesional.profesional_id);
      res.status(201).json({ persona, profesional });
    } catch (error) {
      console.error('[POST /profesionales] ❌ ERROR:', error);
      if (error instanceof Error) {
        console.error('→ Prisma error message:', error.message);
      }
      res.status(500).json({ error: 'Error al crear profesional' });
    }
  });  
});


export default router;