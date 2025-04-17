const pool = require('../models/db');
const { logGeneral } = require('../utils/logger');

/**
 * Obtiene todos los exámenes
 */
const obtenerTodos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM examenes ORDER BY nombre_examen');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener exámenes:', err);
    logGeneral(`❌ Error al obtener exámenes: ${err.message}`);
    res.status(500).json({ error: 'Error al obtener exámenes' });
  }
};

/**
 * Obtiene un examen por su código
 */
const obtenerPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const result = await pool.query('SELECT * FROM examenes WHERE codigo = $1', [codigo]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener examen:', err);
    logGeneral(`❌ Error al obtener examen: ${err.message}`);
    res.status(500).json({ error: 'Error al obtener examen' });
  }
};

/**
 * Crea un nuevo examen
 */
const crear = async (req, res) => {
  const { codigo, nombre_examen, preciousd, tiempo_entrega, informacion, tipo } = req.body;
  
  if (!codigo || !nombre_examen || !preciousd) {
    return res.status(400).json({ error: 'Código, nombre y precio son obligatorios' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO examenes (codigo, nombre_examen, preciousd, tiempo_entrega, informacion, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [codigo, nombre_examen, preciousd, tiempo_entrega, informacion, tipo]
    );
    
    logGeneral(`✅ Examen creado: ${nombre_examen} (${codigo})`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear examen:', err);
    logGeneral(`❌ Error al crear examen: ${err.message}`);
    res.status(500).json({ error: 'Error al crear examen' });
  }
};

/**
 * Actualiza un examen existente
 */
const actualizar = async (req, res) => {
  const { codigo } = req.params;
  const { nombre_examen, preciousd, tiempo_entrega, informacion, tipo } = req.body;
  
  if (!nombre_examen || !preciousd) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }
  
  try {
    const result = await pool.query(
      'UPDATE examenes SET nombre_examen = $1, preciousd = $2, tiempo_entrega = $3, informacion = $4, tipo = $5 WHERE codigo = $6 RETURNING *',
      [nombre_examen, preciousd, tiempo_entrega, informacion, tipo, codigo]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    logGeneral(`✅ Examen actualizado: ${nombre_examen} (${codigo})`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar examen:', err);
    logGeneral(`❌ Error al actualizar examen: ${err.message}`);
    res.status(500).json({ error: 'Error al actualizar examen' });
  }
};

/**
 * Elimina un examen
 */
const eliminar = async (req, res) => {
  const { codigo } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM examenes WHERE codigo = $1 RETURNING *', [codigo]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    logGeneral(`✅ Examen eliminado: ${result.rows[0].nombre_examen} (${codigo})`);
    res.json({ message: 'Examen eliminado correctamente', examen: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar examen:', err);
    logGeneral(`❌ Error al eliminar examen: ${err.message}`);
    res.status(500).json({ error: 'Error al eliminar examen' });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorCodigo,
  crear,
  actualizar,
  eliminar
};