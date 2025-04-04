import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem
} from '@mui/material';
import axios from '../services/axios';

const ProfesionalForm = ({ open, onClose, onCreated }) => {
  const [especialidades, setEspecialidades] = useState([]);
  const [formData, setFormData] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    especialidad_id: ''
  });

  useEffect(() => {
    if (open) {
      axios.get('/especialidades')
        .then((res) => setEspecialidades(res.data))
        .catch((err) => console.error('Error al cargar especialidades', err));
    }
  }, [open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    axios.post('/profesionales', formData)
      .then(() => {
        onCreated(); // recargar lista
        onClose();   // cerrar modal
      })
      .catch(err => {
        console.error('Error al crear profesional:', err);
      });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Nuevo Profesional</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField label="Cédula" name="cedula" value={formData.cedula} onChange={handleChange} />
        <TextField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
        <TextField label="Apellido" name="apellido" value={formData.apellido} onChange={handleChange} />
        <TextField label="Email" name="email" value={formData.email} onChange={handleChange} />
        <TextField label="Teléfono" name="telefono" value={formData.telefono} onChange={handleChange} />
        <TextField
          select
          label="Especialidad"
          name="especialidad_id"
          value={formData.especialidad_id}
          onChange={handleChange}
        >
          {especialidades.map((esp) => (
            <MenuItem key={esp.especialidad_id} value={esp.especialidad_id}>
              {esp.nombre}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Cancelar</Button>
        <Button onClick={handleSubmit} variant="contained">Guardar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfesionalForm;
