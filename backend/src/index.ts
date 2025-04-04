import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Rutas externas
import horarioRouter from './routes/horario';
import excepcionRouter from './routes/excepciones';
import disponibilidadRouter from './routes/disponibilidad';
import especialidadesRouter from './routes/especialidades';
import tipoAtencionRouter from './routes/tipoAtencion';
import agendamientoRouter from './routes/agendamiento';
import profesionalesRouter from './routes/profesionales';

console.log("🌍 DATABASE_URL desde process.env:", process.env.DATABASE_URL);

// Config
dotenv.config();
const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/disponibilidad', disponibilidadRouter);
app.use('/especialidades', especialidadesRouter);
app.use('/tipo-atencion', tipoAtencionRouter);
app.use('/agendamiento', agendamientoRouter);
app.use('/profesionales', profesionalesRouter);

// Prisma
const prisma = new PrismaClient();

// Ruta de prueba
app.get('/', (req: Request, res: Response) => {
  res.send('✅ API de Medic Center funcionando');
});

// GET: Listar profesionales
app.get('/profesionales', async (req: Request, res: Response) => {
  try {
    const profesionales = await prisma.profesional.findMany({
      include: {
        persona: true,
        especialidad: true,
      }
    });
    res.json(profesionales);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener profesionales', detail: error });
  }
});

// POST: Crear profesional
app.post('/profesionales', async (req: Request, res: Response) => {
  try {
    const { cedula, nombre, apellido, telefono, email, especialidad_id } = req.body;

    // Crea o actualiza la persona
    const persona = await prisma.persona.upsert({
      where: { cedula },
      update: { nombre, apellido, telefono, email },
      create: { cedula, nombre, apellido, telefono, email }
    });

    // Crea profesional (solo si no existe)
    const profesional = await prisma.profesional.upsert({
      where: { cedula },
      update: {},
      create: {
        cedula,
        especialidad_id
      }
    });

    res.status(201).json({ persona, profesional });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al crear profesional', detail: error });
  }
});

// Usar rutas externas
app.use('/horario', horarioRouter);
app.use('/horario/excepcion', excepcionRouter);

// Start server en 0.0.0.0 (acepta conexiones externas)
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`🚀 Servidor backend corriendo en http://0.0.0.0:${port}`);
});
