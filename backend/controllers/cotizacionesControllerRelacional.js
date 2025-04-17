const CotizacionesModel = require('../models/cotizacionesModelRelacional');
const { logGeneral } = require('../utils/logger');

const CotizacionesController = {
  /**
   * Crea una nueva cotización y la relaciona con el paciente
   */
  crear: async (req, res) => {
    const { nombre, apellido, cedula, email, telefono, examenes, tasaCambio } = req.body;

    logGeneral(`🧾 Nueva cotización recibida para: ${nombre} ${apellido} (${cedula})`);

    if (!cedula || !nombre || !apellido || !examenes || !Array.isArray(examenes) || examenes.length === 0 || !tasaCambio) {
      logGeneral(`❌ Validación fallida al recibir cotización`);
      return res.status(400).json({ error: 'Datos incompletos' });
    }

    try {
      // Crear cotización y relacionarla con paciente
      const resultado = await CotizacionesModel.crear({
        nombre,
        apellido,
        cedula, 
        email, 
        telefono, 
        examenes,
        tasaCambio
      });
      
      // Generar PDF y enviar correo
      const nombreCompleto = `${nombre} ${apellido}`;
      const docResults = await CotizacionesModel.procesarDocumentos(
        resultado.id,
        nombreCompleto, 
        email
      );
      
      res.json({ 
        id: resultado.id,
        cedula: resultado.cedula,
        emailEnviado: docResults.enviado,
        totalUSD: resultado.totalUSD,
        totalVES: resultado.totalVES
      });
    } catch (err) {
      console.error('❌ Error al crear cotización:', err.message);
      logGeneral(`❌ Error al crear cotización: ${err.message}`);
      res.status(500).json({ error: 'Error al crear cotización', detalle: err.message });
    }
  },
  
  /**
   * Obtiene cotizaciones para panel administrativo
   */
  obtenerListado: async (req, res) => {
    try {
      const filtros = {
        cedula: req.query.cedula,
        nombre: req.query.nombre,
        estado: req.query.estado,
        fechaDesde: req.query.fechaDesde,
        fechaHasta: req.query.fechaHasta,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20
      };
      
      const resultado = await CotizacionesModel.obtenerParaAdmin(filtros);
      res.json(resultado);
    } catch (err) {
      console.error('❌ Error al obtener cotizaciones:', err.message);
      res.status(500).json({ error: 'Error al obtener cotizaciones', detalle: err.message });
    }
  },
  
  /**
   * Obtiene una cotización por su ID
   */
  obtenerPorId: async (req, res) => {
    try {
      const cotizacionId = req.params.id;
      const cotizacion = await CotizacionesModel.obtenerPorId(cotizacionId);
      
      if (!cotizacion) {
        return res.status(404).json({ error: 'Cotización no encontrada' });
      }
      
      res.json(cotizacion);
    } catch (err) {
      console.error('❌ Error al obtener cotización:', err.message);
      res.status(500).json({ error: 'Error al obtener cotización', detalle: err.message });
    }
  },
  
  /**
   * Actualiza el estado de una cotización
   */
  actualizarEstado: async (req, res) => {
    try {
      const cotizacionId = req.params.id;
      const { estado, responsable, observaciones } = req.body;
      
      if (!estado) {
        return res.status(400).json({ error: 'El estado es requerido' });
      }
      
      const resultado = await CotizacionesModel.actualizarEstado(
        cotizacionId,
        estado,
        responsable,
        observaciones
      );
      
      res.json(resultado);
    } catch (err) {
      console.error('❌ Error al actualizar estado:', err.message);
      res.status(500).json({ error: 'Error al actualizar estado', detalle: err.message });
    }
  },
  
  /**
   * Agrega una entrada de seguimiento
   */
  agregarSeguimiento: async (req, res) => {
    try {
      const cotizacionId = req.params.id;
      const { tipo, usuario, comentario, resultado } = req.body;
      
      if (!tipo || !usuario || !comentario) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
      }
      
      const registroSeguimiento = await CotizacionesModel.agregarSeguimiento({
        cotizacionId,
        tipo,
        usuario,
        comentario,
        resultado
      });
      
      res.json(registroSeguimiento);
    } catch (err) {
      console.error('❌ Error al agregar seguimiento:', err.message);
      res.status(500).json({ error: 'Error al agregar seguimiento', detalle: err.message });
    }
  },
  
  /**
   * Obtiene estadísticas para el dashboard
   */
  obtenerEstadisticas: async (req, res) => {
    try {
      const fechaDesde = req.query.fechaDesde || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const fechaHasta = req.query.fechaHasta || new Date();
      
      const estadisticas = await CotizacionesModel.obtenerEstadisticas(fechaDesde, fechaHasta);
      res.json(estadisticas);
    } catch (err) {
      console.error('❌ Error al obtener estadísticas:', err.message);
      res.status(500).json({ error: 'Error al obtener estadísticas', detalle: err.message });
    }
  }
};

module.exports = CotizacionesController;