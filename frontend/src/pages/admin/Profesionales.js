import React, { useEffect, useState } from 'react';
import axios from '../../services/axios';
import ProfesionalForm from '../../components/ProfesionalForm';

import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  CircularProgress,
  Button
} from '@mui/material';

const Profesionales = () => {
  const [profesionales, setProfesionales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);

  const fetchProfesionales = () => {
    setLoading(true);
    axios.get('/profesionales')
      .then((res) => setProfesionales(res.data))
      .catch((err) => console.error('Error al obtener profesionales:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProfesionales();
  }, []);

  return (
    <Box sx={{ p: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Profesionales</Typography>
        <Button variant="contained" onClick={() => setFormOpen(true)}>+ Agregar</Button>
      </Box>

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
                  <TableCell>{p.persona?.nombre || '-'}</TableCell>
                  <TableCell>{p.persona?.apellido || '-'}</TableCell>
                  <TableCell>{p.cedula}</TableCell>
                  <TableCell>{p.especialidad?.nombre || '-'}</TableCell>
                  <TableCell>{p.persona?.telefono || '—'}</TableCell>
                  <TableCell>{p.persona?.email || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      <ProfesionalForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={fetchProfesionales}
      />
    </Box>
  );
};

export default Profesionales;