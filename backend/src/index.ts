import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

import horarioRouter from './routes/horario';
import disponibilidadRouter from './routes/disponibilidad';
import especialidadesRouter from './routes/especialidades';
import tipoAtencionRouter from './routes/tipoAtencion';
import profesionalesRouter from './routes/profesionales';
import agendamientoRouter from './routes/agendamiento';
import excepcionRouter from './routes/excepciones';

dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

console.log('🌍 DATABASE_URL:', process.env.DATABASE_URL);

app.get('/', (_req: Request, res: Response) => {
  res.send('✅ API de Medic Center funcionando');
});

app.use('/horario', horarioRouter);
app.use('/horario/excepcion', excepcionRouter);
app.use('/agendamiento', agendamientoRouter);
app.use('/disponibilidad', disponibilidadRouter);
app.use('/especialidades', especialidadesRouter);
app.use('/tipo-atencion', tipoAtencionRouter);
app.use('/profesionales', profesionalesRouter);

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`🚀 Servidor backend corriendo en http://0.0.0.0:${port}`);
});
