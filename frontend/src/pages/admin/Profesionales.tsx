import React, { useEffect, useState } from 'react';
import axios from '../../services/axios';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress
} from '@mui/material';

interface Profesional {
  profesional_id: string;
  cedula: string;
  persona: {
    nombre: string;
    apellido: string;
    email?: string;
    telefono?: string;
  };
  especialidad: {
    nombre: string;
  };
}

const Profesionales = () => {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('/profesionales')
      .then((res) => {
        setProfesionales(res.data);
      })
      .catch((err) => {
        console.error('Error al obtener profesionales:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Profesionales
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <Paper>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Apellido</TableCell>
                <TableCell>Cédula</TableCell>
                <TableCell>Especialidad</TableCell>
                <TableCell>Teléfono</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {profesionales.map((p) => (
                <TableRow key={p.profesional_id}>
                  <TableCell>{p.persona.nombre}</TableCell>
                  <TableCell>{p.persona.apellido}</TableCell>
                  <TableCell>{p.cedula}</TableCell>
                  <TableCell>{p.especialidad.nombre}</TableCell>
                  <TableCell>{p.persona.telefono || '—'}</TableCell>
                  <TableCell>{p.persona.email || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}
    </Box>
  );
};

export default Profesionales;
