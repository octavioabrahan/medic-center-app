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
  
  // Obtener un cliente para comenzar una transacción
  const client = await pool.getClient();
  
  try {
    await client.query('BEGIN'); // Iniciar transacción
    
    // Verificar que el examen exista
    const checkResult = await client.query(
      'SELECT * FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
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
      await client.query('ROLLBACK');
      console.log(`[ExamenController] El examen ya estaba archivado. No se realizan cambios.`);
      return res.json({
        ...examenActual,
        mensaje: 'El examen ya estaba archivado'
      });
    }
    
    // Usar una consulta simple que solo modifique is_active, sin tocar otros campos
    const result = await client.query(
      'UPDATE examenes SET is_active = false WHERE codigo = $1 RETURNING *',
      [codigo]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      console.error(`[ExamenController] Error inesperado: No se devolvió ninguna fila después de archivar`);
      return res.status(500).json({ error: 'Error al archivar examen: No se devolvió ningún resultado' });
    }
    
    // Confirmar la transacción
    await client.query('COMMIT');
    
    console.log(`[ExamenController] Examen archivado correctamente:`, {
      codigo: result.rows[0].codigo,
      is_active_anterior: examenActual.is_active,
      is_active_nuevo: result.rows[0].is_active,
      tipo: result.rows[0].tipo // Solo verificar el tipo final
    });
    
    // Verificar que is_active realmente cambió en la base de datos (fuera de la transacción)
    const verificacion = await pool.query(
      'SELECT is_active FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (verificacion.rows.length > 0) {
      console.log(`[ExamenController] Verificación post-archivado: is_active = ${verificacion.rows[0].is_active}`);
      
      if (verificacion.rows[0].is_active !== false) {
        console.error(`[ExamenController] ADVERTENCIA: El estado no cambió a pesar del COMMIT exitoso!`);
      }
    }
    
    res.json({
      ...result.rows[0],
      resultado: 'archivado_correctamente'
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(e => console.error('Error en ROLLBACK:', e));
    
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
  } finally {
    client.release(); // Siempre liberar el cliente al final
  }
};

/**
 * Desarchivar un examen (cambia su estado a activo)
 */
const desarchivar = async (req, res) => {
  const { codigo } = req.params;
  
  console.log(`[ExamenController] Intentando desarchivar examen con código: ${codigo}`);
  
  // Obtener un cliente para comenzar una transacción
  const client = await pool.getClient();
  
  try {
    await client.query('BEGIN'); // Iniciar transacción
    
    // Verificar que el examen exista
    const checkResult = await client.query(
      'SELECT * FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
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
      await client.query('ROLLBACK');
      console.log(`[ExamenController] El examen ya estaba activo. No se realizan cambios.`);
      return res.json({
        ...examenActual,
        mensaje: 'El examen ya estaba activo'
      });
    }
    
    // Usar una consulta simple que solo modifique is_active, sin tocar otros campos
    const result = await client.query(
      'UPDATE examenes SET is_active = true WHERE codigo = $1 RETURNING *',
      [codigo]
    );
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      console.error(`[ExamenController] Error inesperado: No se devolvió ninguna fila después de desarchivar`);
      return res.status(500).json({ error: 'Error al desarchivar examen: No se devolvió ningún resultado' });
    }
    
    // Confirmar la transacción
    await client.query('COMMIT');
    
    console.log(`[ExamenController] Examen desarchivado correctamente:`, {
      codigo: result.rows[0].codigo,
      is_active_anterior: examenActual.is_active,
      is_active_nuevo: result.rows[0].is_active,
      tipo: result.rows[0].tipo // Solo verificar el tipo final
    });
    
    // Verificar que is_active realmente cambió en la base de datos (fuera de la transacción)
    const verificacion = await pool.query(
      'SELECT is_active FROM examenes WHERE codigo = $1',
      [codigo]
    );
    
    if (verificacion.rows.length > 0) {
      console.log(`[ExamenController] Verificación post-desarchivado: is_active = ${verificacion.rows[0].is_active}`);
      
      if (verificacion.rows[0].is_active !== true) {
        console.error(`[ExamenController] ADVERTENCIA: El estado no cambió a pesar del COMMIT exitoso!`);
      }
    }
    
    res.json({
      ...result.rows[0],
      resultado: 'desarchivado_correctamente'
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(e => console.error('Error en ROLLBACK:', e));
    
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
  } finally {
    client.release(); // Siempre liberar el cliente al final
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