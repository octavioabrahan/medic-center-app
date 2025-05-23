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
  
  console.log(`[ExamenController] Intentando archivar examen con código: ${codigo}`);
  
  try {
    // Verificar que el examen exista
    const checkResult = await pool.query(
      'SELECT * FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (checkResult.rows.length === 0) {
      console.error(`[ExamenController] Examen no encontrado para archivar: ${codigo}`);
      return res.status(404).json({ 
        error: 'Examen no encontrado',
        codigo: codigo,
        operacion: 'archivar'
      });
    }
    
    const examenActual = checkResult.rows[0];
    console.log(`[ExamenController] Examen encontrado:`, {
      codigo: examenActual.codigo,
      nombre: examenActual.nombre_examen,
      is_active: examenActual.is_active,
      tipo: examenActual.tipo
    });
    
    // Si ya está archivado, no hacer nada y devolver éxito
    if (examenActual.is_active === false) {
      console.log(`[ExamenController] El examen ya estaba archivado. No se realizan cambios.`);
      return res.json({
        ...examenActual,
        mensaje: 'El examen ya estaba archivado'
      });
    }
    
    // Explícitamente preservar el campo tipo para evitar conversiones no deseadas
    const result = await pool.query(
      'UPDATE examenes SET is_active = false, tipo = $2 WHERE codigo = $1 RETURNING *',
      [codigo, examenActual.tipo]
    );
    
    if (result.rows.length === 0) {
      console.error(`[ExamenController] Error inesperado: No se devolvió ninguna fila después de archivar`);
      return res.status(500).json({ error: 'Error al archivar examen: No se devolvió ningún resultado' });
    }
    
    console.log(`[ExamenController] Examen archivado correctamente:`, {
      codigo: result.rows[0].codigo,
      is_active_anterior: examenActual.is_active,
      is_active_nuevo: result.rows[0].is_active,
      tipo_anterior: examenActual.tipo === null ? "NULL" : (examenActual.tipo === "" ? "CADENA_VACIA" : examenActual.tipo),
      tipo_nuevo: result.rows[0].tipo === null ? "NULL" : (result.rows[0].tipo === "" ? "CADENA_VACIA" : result.rows[0].tipo)
    });
    
    res.json({
      ...result.rows[0],
      resultado: 'archivado_correctamente'
    });
  } catch (err) {
    console.error('[ExamenController] Error al archivar examen:', err);
    console.error('[ExamenController] Detalles:', {
      codigo: codigo,
      mensaje: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: 'Error al archivar examen',
      mensaje: err.message,
      codigo_error: err.code || 'UNKNOWN'
    });
  }
};

/**
 * Desarchivar un examen (cambia su estado a activo)
 */
const desarchivar = async (req, res) => {
  const { codigo } = req.params;
  
  console.log(`[ExamenController] Intentando desarchivar examen con código: ${codigo}`);
  
  try {
    // Verificar que el examen exista
    const checkResult = await pool.query(
      'SELECT * FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (checkResult.rows.length === 0) {
      console.error(`[ExamenController] Examen no encontrado para desarchivar: ${codigo}`);
      return res.status(404).json({ 
        error: 'Examen no encontrado',
        codigo: codigo,
        operacion: 'desarchivar'
      });
    }
    
    const examenActual = checkResult.rows[0];
    console.log(`[ExamenController] Examen encontrado:`, {
      codigo: examenActual.codigo,
      nombre: examenActual.nombre_examen,
      is_active: examenActual.is_active,
      tipo: examenActual.tipo
    });
    
    // Si ya está activo, no hacer nada y devolver éxito
    if (examenActual.is_active === true) {
      console.log(`[ExamenController] El examen ya estaba activo. No se realizan cambios.`);
      return res.json({
        ...examenActual,
        mensaje: 'El examen ya estaba activo'
      });
    }
    
    // Explícitamente preservar el campo tipo para evitar conversiones no deseadas
    const result = await pool.query(
      'UPDATE examenes SET is_active = true, tipo = $2 WHERE codigo = $1 RETURNING *',
      [codigo, examenActual.tipo]
    );
    
    if (result.rows.length === 0) {
      console.error(`[ExamenController] Error inesperado: No se devolvió ninguna fila después de desarchivar`);
      return res.status(500).json({ error: 'Error al desarchivar examen: No se devolvió ningún resultado' });
    }
    
    console.log(`[ExamenController] Examen desarchivado correctamente:`, {
      codigo: result.rows[0].codigo,
      is_active_anterior: examenActual.is_active,
      is_active_nuevo: result.rows[0].is_active,
      tipo_anterior: examenActual.tipo === null ? "NULL" : (examenActual.tipo === "" ? "CADENA_VACIA" : examenActual.tipo),
      tipo_nuevo: result.rows[0].tipo === null ? "NULL" : (result.rows[0].tipo === "" ? "CADENA_VACIA" : result.rows[0].tipo)
    });
    
    res.json({
      ...result.rows[0],
      resultado: 'desarchivado_correctamente'
    });
  } catch (err) {
    console.error('[ExamenController] Error al desarchivar examen:', err);
    console.error('[ExamenController] Detalles:', {
      codigo: codigo,
      mensaje: err.message,
      stack: err.stack
    });
    
    res.status(500).json({ 
      error: 'Error al desarchivar examen',
      mensaje: err.message,
      codigo_error: err.code || 'UNKNOWN'
    });
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