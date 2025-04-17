const pool = require('../models/db');
const { logGeneral } = require('../utils/logger');

/**
 * Obtiene todos los seguimientos de una cotización
 */
const obtenerPorCotizacion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(`
      SELECT s.*, 
             c.folio as cotizacion_folio,
             cl.nombre as cliente_nombre,
             cl.apellido as cliente_apellido
      FROM seguimiento_cotizacion s
      JOIN cotizaciones c ON s.cotizacion_id = c.id_unico
      JOIN clientes cl ON c.cedula_cliente = cl.cedula
      WHERE s.cotizacion_id = $1
      ORDER BY s.fecha_seguimiento DESC
    `, [id]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener seguimientos:', err);
    logGeneral(`❌ Error al obtener seguimientos: ${err.message}`);
    res.status(500).json({ error: 'Error al obtener seguimientos' });
  }
};

/**
 * Crea un nuevo seguimiento
 */
const crear = async (req, res) => {
  const { 
    cotizacion_id, 
    tipo_contacto, 
    resultado, 
    comentarios, 
    usuario, 
    proxima_accion, 
    fecha_proxima_accion 
  } = req.body;
  
  if (!cotizacion_id || !tipo_contacto || !resultado) {
    return res.status(400).json({ error: 'Cotización, tipo de contacto y resultado son obligatorios' });
  }
  
  try {
    // Verificar que la cotización existe
    const cotizacionCheck = await pool.query('SELECT id_unico FROM cotizaciones WHERE id_unico = $1', [cotizacion_id]);
    if (cotizacionCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Cotización no encontrada' });
    }
    
    const result = await pool.query(`
      INSERT INTO seguimiento_cotizacion (
        cotizacion_id, 
        tipo_contacto, 
        resultado, 
        comentarios, 
        usuario, 
        proxima_accion, 
        fecha_proxima_accion
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [
      cotizacion_id, 
      tipo_contacto, 
      resultado, 
      comentarios, 
      usuario, 
      proxima_accion, 
      fecha_proxima_accion
    ]);
    
    // Actualizar estado de la cotización según el resultado
    let nuevoEstado = null;
    if (resultado === 'exitoso') {
      nuevoEstado = 'confirmado';
    } else if (resultado === 'rechazado') {
      nuevoEstado = 'cancelado';
    } else if (resultado === 'sin respuesta') {
      nuevoEstado = 'pendiente';
    }
    
    if (nuevoEstado) {
      await pool.query('UPDATE cotizaciones SET estado = $1 WHERE id_unico = $2', [nuevoEstado, cotizacion_id]);
    }
    
    logGeneral(`✅ Seguimiento creado para cotización ${cotizacion_id}: ${tipo_contacto} - ${resultado}`);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error al crear seguimiento:', err);
    logGeneral(`❌ Error al crear seguimiento: ${err.message}`);
    res.status(500).json({ error: 'Error al crear seguimiento' });
  }
};

/**
 * Actualiza un seguimiento existente
 */
const actualizar = async (req, res) => {
  const { id } = req.params;
  const { 
    tipo_contacto, 
    resultado, 
    comentarios, 
    usuario, 
    proxima_accion, 
    fecha_proxima_accion 
  } = req.body;
  
  if (!tipo_contacto || !resultado) {
    return res.status(400).json({ error: 'Tipo de contacto y resultado son obligatorios' });
  }
  
  try {
    const result = await pool.query(`
      UPDATE seguimiento_cotizacion
      SET tipo_contacto = $1,
          resultado = $2,
          comentarios = $3,
          usuario = $4,
          proxima_accion = $5,
          fecha_proxima_accion = $6
      WHERE id = $7
      RETURNING *
    `, [
      tipo_contacto, 
      resultado, 
      comentarios, 
      usuario, 
      proxima_accion, 
      fecha_proxima_accion,
      id
    ]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seguimiento no encontrado' });
    }
    
    // Opcional: Actualizar estado de la cotización si es necesario
    
    logGeneral(`✅ Seguimiento ${id} actualizado: ${tipo_contacto} - ${resultado}`);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al actualizar seguimiento:', err);
    logGeneral(`❌ Error al actualizar seguimiento: ${err.message}`);
    res.status(500).json({ error: 'Error al actualizar seguimiento' });
  }
};

/**
 * Elimina un seguimiento
 */
const eliminar = async (req, res) => {
  const { id } = req.params;
  
  try {
    const result = await pool.query('DELETE FROM seguimiento_cotizacion WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Seguimiento no encontrado' });
    }
    
    logGeneral(`✅ Seguimiento ${id} eliminado`);
    res.json({ message: 'Seguimiento eliminado correctamente', seguimiento: result.rows[0] });
  } catch (err) {
    console.error('Error al eliminar seguimiento:', err);
    logGeneral(`❌ Error al eliminar seguimiento: ${err.message}`);
    res.status(500).json({ error: 'Error al eliminar seguimiento' });
  }
};

/**
 * Obtiene seguimientos pendientes para hoy
 */
const obtenerPendientesHoy = async (req, res) => {
  try {
    const fechaHoy = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
    
    const result = await pool.query(`
      SELECT s.*, 
             c.folio as cotizacion_folio,
             cl.nombre as cliente_nombre,
             cl.apellido as cliente_apellido,
             cl.telefono as cliente_telefono,
             cl.email as cliente_email
      FROM seguimiento_cotizacion s
      JOIN cotizaciones c ON s.cotizacion_id = c.id_unico
      JOIN clientes cl ON c.cedula_cliente = cl.cedula
      WHERE s.fecha_proxima_accion = $1
      ORDER BY s.fecha_proxima_accion ASC
    `, [fechaHoy]);
    
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener seguimientos pendientes:', err);
    logGeneral(`❌ Error al obtener seguimientos pendientes: ${err.message}`);
    res.status(500).json({ error: 'Error al obtener seguimientos pendientes' });
  }
};

module.exports = {
  obtenerPorCotizacion,
  crear,
  actualizar,
  eliminar,
  obtenerPendientesHoy
};