const pool = require('../models/db');

/**
 * Obtiene todos los exámenes
 */
const obtenerTodos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM examenes ORDER BY nombre_examen');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener exámenes:', err);
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
    res.status(500).json({ error: 'Error al obtener examen' });
  }
};

/**
 * Crea un nuevo examen
 */
const crear = async (req, res) => {
  const { codigo, nombre_examen, preciousd, tiempo_entrega, informacion, tipo } = req.body;
  const is_active = req.body.is_active !== undefined ? req.body.is_active : true;
  
  if (!codigo || !nombre_examen || !preciousd) {
    return res.status(400).json({ error: 'Código, nombre y precio son obligatorios' });
  }
  
  try {
    const result = await pool.query(
      'INSERT INTO examenes (codigo, nombre_examen, preciousd, tiempo_entrega, informacion, tipo, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [codigo, nombre_examen, preciousd, tiempo_entrega, informacion, tipo, is_active]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear examen:', err);
    res.status(500).json({ error: 'Error al crear examen' });
  }
};

/**
 * Actualiza un examen existente
 */
const actualizar = async (req, res) => {
  const { codigo } = req.params;
  const { nombre_examen, preciousd, tiempo_entrega, informacion, tipo, is_active } = req.body;
  
  if (!nombre_examen || !preciousd) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }
  
  try {
    // Verificar que el examen exista
    const checkResult = await pool.query(
      'SELECT * FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    // Actualizar el examen (sin historial)
    const result = await pool.query(
      'UPDATE examenes SET nombre_examen = $1, preciousd = $2, tiempo_entrega = $3, informacion = $4, tipo = $5, is_active = $6 WHERE codigo = $7 RETURNING *',
      [nombre_examen, preciousd, tiempo_entrega, informacion, tipo, is_active !== undefined ? is_active : checkResult.rows[0].is_active, codigo]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar examen:', err);
    res.status(500).json({ error: 'Error al actualizar examen' });
  }
};

/**
 * Elimina un examen
 */
const eliminar = async (req, res) => {
  const { codigo } = req.params;
  
  try {
    // Verificar que el examen exista
    const checkResult = await pool.query(
      'SELECT * FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    // Eliminar el examen - sin historial
    const result = await pool.query('DELETE FROM examenes WHERE codigo = $1 RETURNING *', [codigo]);
    
    res.json({ message: 'Examen eliminado correctamente', examen: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar examen:', err);
    res.status(500).json({ error: 'Error al eliminar examen' });
  }
};

/**
 * Obtiene el historial de cambios de un examen - simplificado para retornar un array vacío
 */
const obtenerHistorial = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    // Verificar que el examen exista
    const examenResult = await pool.query('SELECT * FROM examenes WHERE codigo = $1', [codigo]);
    
    if (examenResult.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    // Devolver un array vacío
    res.json([]);
  } catch (err) {
    console.error('Error al obtener historial del examen:', err);
    res.status(500).json({ error: 'Error al obtener historial del examen' });
  }
};

/**
 * Archivar un examen (cambia su estado a inactivo)
 */
const archivar = async (req, res) => {
  const { codigo } = req.params;
  
  try {
    // Verificar que el examen exista
    const checkResult = await pool.query(
      'SELECT * FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    // Actualizar el examen a inactivo - sin transacción ni registro de historial
    const result = await pool.query(
      'UPDATE examenes SET is_active = false WHERE codigo = $1 RETURNING *',
      [codigo]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al archivar examen:', err);
    res.status(500).json({ error: 'Error al archivar examen' });
  }
};

/**
 * Desarchivar un examen (cambia su estado a activo)
 */
const desarchivar = async (req, res) => {
  const { codigo } = req.params;
  
  try {
    // Verificar que el examen exista
    const checkResult = await pool.query(
      'SELECT * FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    // Actualizar el examen a activo - sin transacción ni registro de historial
    const result = await pool.query(
      'UPDATE examenes SET is_active = true WHERE codigo = $1 RETURNING *',
      [codigo]
    );
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al desarchivar examen:', err);
    res.status(500).json({ error: 'Error al desarchivar examen' });
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorCodigo,
  crear,
  actualizar,
  eliminar,
  obtenerHistorial,
  archivar,
  desarchivar
};