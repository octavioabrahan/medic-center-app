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
  const usuario = 'admin'; // Siempre usar 'admin' como usuario
  const is_active = req.body.is_active !== undefined ? req.body.is_active : true; // Por defecto los exámenes están activos
  
  if (!codigo || !nombre_examen || !preciousd) {
    return res.status(400).json({ error: 'Código, nombre y precio son obligatorios' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Insertar el examen
    const result = await client.query(
      'INSERT INTO examenes (codigo, nombre_examen, preciousd, tiempo_entrega, informacion, tipo, is_active) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [codigo, nombre_examen, preciousd, tiempo_entrega, informacion, tipo, is_active]
    );
    
    // Registrar en el historial
    await client.query(
      'INSERT INTO examen_historial (codigo_examen, is_active_anterior, is_active_nuevo, cambiado_por) VALUES ($1, $2, $3, $4)',
      [codigo, false, is_active, usuario]
    );
    
    await client.query('COMMIT');
    
    logGeneral(`✅ Examen creado: ${nombre_examen} (${codigo}) por ${usuario}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al crear examen:', err);
    logGeneral(`❌ Error al crear examen: ${err.message}`);
    res.status(500).json({ error: 'Error al crear examen' });
  } finally {
    client.release();
  }
};

/**
 * Actualiza un examen existente
 */
const actualizar = async (req, res) => {
  const { codigo } = req.params;
  const { nombre_examen, preciousd, tiempo_entrega, informacion, tipo, is_active } = req.body;
  const usuario = 'admin'; // Siempre usar 'admin' como usuario
  
  if (!nombre_examen || !preciousd) {
    return res.status(400).json({ error: 'Nombre y precio son obligatorios' });
  }
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Obtener el estado anterior del examen
    const prevStateResult = await client.query('SELECT is_active FROM examenes WHERE codigo = $1', [codigo]);
    
    if (prevStateResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    const isActiveAnterior = prevStateResult.rows[0].is_active;
    const isActiveNuevo = is_active !== undefined ? is_active : isActiveAnterior;
    
    // Actualizar el examen (sin updated_at que no existe en la tabla)
    const result = await client.query(
      'UPDATE examenes SET nombre_examen = $1, preciousd = $2, tiempo_entrega = $3, informacion = $4, tipo = $5, is_active = $6 WHERE codigo = $7 RETURNING *',
      [nombre_examen, preciousd, tiempo_entrega, informacion, tipo, isActiveNuevo, codigo]
    );
    
    // Registrar en el historial solo si cambió el estado de is_active
    if (isActiveAnterior !== isActiveNuevo) {
      await client.query(
        'INSERT INTO examen_historial (codigo_examen, is_active_anterior, is_active_nuevo, cambiado_por) VALUES ($1, $2, $3, $4)',
        [codigo, isActiveAnterior, isActiveNuevo, usuario]
      );
    }
    
    await client.query('COMMIT');
    
    logGeneral(`✅ Examen actualizado: ${nombre_examen} (${codigo}) por ${usuario}`);
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar examen:', err);
    logGeneral(`❌ Error al actualizar examen: ${err.message}`);
    res.status(500).json({ error: 'Error al actualizar examen' });
  } finally {
    client.release();
  }
};

/**
 * Elimina un examen
 */
const eliminar = async (req, res) => {
  const { codigo } = req.params;
  const usuario = 'admin'; // Siempre usar 'admin' como usuario
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Obtener información del examen antes de eliminar
    const examenResult = await client.query('SELECT * FROM examenes WHERE codigo = $1', [codigo]);
    
    if (examenResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    const examen = examenResult.rows[0];
    
    // Registrar en el historial
    await client.query(
      'INSERT INTO examen_historial (codigo_examen, is_active_anterior, is_active_nuevo, cambiado_por) VALUES ($1, $2, $3, $4)',
      [codigo, examen.is_active, false, usuario]
    );
    
    // Eliminar el examen
    const result = await client.query('DELETE FROM examenes WHERE codigo = $1 RETURNING *', [codigo]);
    
    await client.query('COMMIT');
    
    logGeneral(`✅ Examen eliminado: ${examen.nombre_examen} (${codigo}) por ${usuario}`);
    res.json({ message: 'Examen eliminado correctamente', examen: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al eliminar examen:', err);
    logGeneral(`❌ Error al eliminar examen: ${err.message}`);
    res.status(500).json({ error: 'Error al eliminar examen' });
  } finally {
    client.release();
  }
};

/**
 * Obtiene el historial de cambios de un examen
 */
const obtenerHistorial = async (req, res) => {
  try {
    const { codigo } = req.params;
    
    // Verificar que el examen exista
    const examenResult = await pool.query('SELECT * FROM examenes WHERE codigo = $1', [codigo]);
    
    if (examenResult.rows.length === 0) {
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    // Obtener el historial de cambios
    const result = await pool.query(`
      SELECT * FROM examen_historial 
      WHERE codigo_examen = $1 
      ORDER BY fecha_cambio DESC
    `, [codigo]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener historial del examen:', err);
    logGeneral(`❌ Error al obtener historial de examen: ${err.message}`);
    res.status(500).json({ error: 'Error al obtener historial del examen' });
  }
};

/**
 * Archivo un examen (cambia su estado a inactivo)
 */
const archivar = async (req, res) => {
  const { codigo } = req.params;
  const usuario = 'admin'; // Usuario fijo como solicita el cliente
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Obtener información del examen antes de archivar
    const examenResult = await client.query('SELECT * FROM examenes WHERE codigo = $1', [codigo]);
    
    if (examenResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    const examen = examenResult.rows[0];
    
    // Si ya está archivado (inactivo), no hacer nada y devolver éxito
    if (!examen.is_active) {
      await client.query('ROLLBACK');
      return res.json({ message: 'El examen ya estaba archivado', examen });
    }
    
    // Actualizar el examen a inactivo
    const result = await client.query(
      'UPDATE examenes SET is_active = false WHERE codigo = $1 RETURNING *',
      [codigo]
    );
    
    // Registrar en el historial
    await client.query(
      'INSERT INTO examen_historial (codigo_examen, is_active_anterior, is_active_nuevo, cambiado_por) VALUES ($1, $2, $3, $4)',
      [codigo, true, false, usuario]
    );
    
    await client.query('COMMIT');
    
    logGeneral(`✅ Examen archivado: ${examen.nombre_examen} (${codigo}) por ${usuario}`);
    res.json({ message: 'Examen archivado correctamente', examen: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al archivar examen:', err);
    logGeneral(`❌ Error al archivar examen: ${err.message}`);
    res.status(500).json({ error: 'Error al archivar examen' });
  } finally {
    client.release();
  }
};

/**
 * Desarchivar un examen (cambia su estado a activo)
 */
const desarchivar = async (req, res) => {
  const { codigo } = req.params;
  const usuario = 'admin'; // Usuario fijo como solicita el cliente
  
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Obtener información del examen antes de desarchivar
    const examenResult = await client.query('SELECT * FROM examenes WHERE codigo = $1', [codigo]);
    
    if (examenResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Examen no encontrado' });
    }
    
    const examen = examenResult.rows[0];
    
    // Si ya está activo, no hacer nada y devolver éxito
    if (examen.is_active) {
      await client.query('ROLLBACK');
      return res.json({ message: 'El examen ya estaba activo', examen });
    }
    
    // Actualizar el examen a activo
    const result = await client.query(
      'UPDATE examenes SET is_active = true WHERE codigo = $1 RETURNING *',
      [codigo]
    );
    
    // Registrar en el historial
    await client.query(
      'INSERT INTO examen_historial (codigo_examen, is_active_anterior, is_active_nuevo, cambiado_por) VALUES ($1, $2, $3, $4)',
      [codigo, false, true, usuario]
    );
    
    await client.query('COMMIT');
    
    logGeneral(`✅ Examen desarchivado: ${examen.nombre_examen} (${codigo}) por ${usuario}`);
    res.json({ message: 'Examen desarchivado correctamente', examen: result.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error al desarchivar examen:', err);
    logGeneral(`❌ Error al desarchivar examen: ${err.message}`);
    res.status(500).json({ error: 'Error al desarchivar examen' });
  } finally {
    client.release();
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