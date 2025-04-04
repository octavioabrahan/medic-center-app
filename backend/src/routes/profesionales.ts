import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET: Listar todos los profesionales
router.get('/', async (_req: Request, res: Response) => {
  console.log('🔍 [GET /profesionales] Iniciando consulta...');

  try {
    const profesionales = await prisma.profesional.findMany({
      include: {
        persona: true,
        especialidad: true,
      },
    });

    console.log(`✅ [GET /profesionales] ${profesionales.length} resultados encontrados`);
    res.json(profesionales);
  } catch (error: any) {
    console.error('❌ [GET /profesionales] Error inesperado:');
    console.error('→ Mensaje:', error.message || error);
    console.error('→ Stack:', error.stack);
    if (error.code) console.error('→ Código Prisma:', error.code);

    res.status(500).json({ error: 'Error al obtener profesionales', detail: error.message });
  }
});

// POST: Crear nuevo profesional
router.post('/', async (req: Request, res: Response) => {
  const { cedula, nombre, apellido, telefono, email, especialidad_id } = req.body;

  console.log('➕ [POST /profesionales] Recibido:', {
    cedula,
    nombre,
    apellido,
    telefono,
    email,
    especialidad_id,
  });

  if (!cedula || !nombre || !apellido || !telefono || !email || !especialidad_id) {
    console.warn('⚠️ [POST /profesionales] Faltan campos obligatorios');
    return res.status(400).json({ error: 'Faltan datos obligatorios' });
  }

  try {
    const persona = await prisma.persona.upsert({
      where: { cedula },
      update: { nombre, apellido, telefono, email },
      create: { cedula, nombre, apellido, telefono, email },
    });

    const profesional = await prisma.profesional.upsert({
      where: { cedula },
      update: {},
      create: { cedula, especialidad_id },
    });

    console.log('✅ [POST /profesionales] Profesional creado:', profesional.profesional_id);

    res.status(201).json({ persona, profesional });
  } catch (error: any) {
    console.error('❌ [POST /profesionales] Error inesperado:');
    console.error('→ Mensaje:', error.message || error);
    console.error('→ Stack:', error.stack);
    if (error.code) console.error('→ Código Prisma:', error.code);

    res.status(500).json({ error: 'Error al crear profesional', detail: error.message });
  }
});

export default router;
