import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Cargar variables de entorno
dotenv.config();

// Instancias
const app = express();
const port = process.env.PORT || 3002;
const prisma = new PrismaClient();

// Logs
console.log("🌍 DATABASE_URL desde process.env:", process.env.DATABASE_URL);

// Middlewares
app.use(cors());
app.use(express.json());

// Importaciones modernas (sin conflictos)
import horarioRouter from './routes/horario';
import disponibilidadRouter from './routes/disponibilidad';
import especialidadesRouter from './routes/especialidades';
import tipoAtencionRouter from './routes/tipoAtencion';
import profesionalesRouter from './routes/profesionales';

// Importaciones clásicas (que causaban TS2769 si eran `import`)
const agendamientoRouter = require('./routes/agendamiento');
const excepcionRouter = require('./routes/excepciones');

// Ruta de prueba
app.get('/', (_req: Request, res: Response) => {
  res.send('✅ API de Medic Center funcionando');
});

// Ruta manual de prueba directa a Prisma
app.get('/profesionales', async (_req: Request, res: Response) => {
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

// Crear profesional directamente
app.post('/profesionales', async (req: Request, res: Response) => {
  try {
    const { cedula, nombre, apellido, telefono, email, especialidad_id } = req.body;

    const persona = await prisma.persona.upsert({
      where: { cedula },
      update: { nombre, apellido, telefono, email },
      create: { cedula, nombre, apellido, telefono, email }
    });

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
app.use('/horario/excepcion', excepcionRouter); // ← esta sí o sí con require() en el archivo
app.use('/agendamiento', agendamientoRouter);   // ← esta también

app.use('/disponibilidad', disponibilidadRouter);
app.use('/especialidades', especialidadesRouter);
app.use('/tipo-atencion', tipoAtencionRouter);
app.use('/profesionales', profesionalesRouter);

// Iniciar servidor
app.listen(Number(port), '0.0.0.0', () => {
  console.log(`🚀 Servidor backend corriendo en http://0.0.0.0:${port}`);
});
