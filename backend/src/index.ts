import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Config
dotenv.config();
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Prisma
const prisma = new PrismaClient();

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('✅ API de Medic Center funcionando');
});

// GET: Listar profesionales
app.get('/profesionales', async (req, res) => {
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
app.post('/profesionales', async (req, res) => {
  try {
    const { cedula, nombre, apellido, telefono, email, especialidad_id } = req.body;

    // Crea persona si no existe
    const persona = await prisma.persona.upsert({
      where: { cedula },
      update: { nombre, apellido, telefono, email },
      create: { cedula, nombre, apellido, telefono, email }
    });

    // Crea profesional
    const profesional = await prisma.profesional.create({
      data: {
        cedula,
        especialidad_id
      }
    });

    res.status(201).json({ persona, profesional });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear profesional', detail: error });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${port}`);
});
