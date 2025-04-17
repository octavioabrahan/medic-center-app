const CotizacionesModel = require('../models/cotizacionesModelRelacional');
const { logGeneral } = require('../utils/logger');

const CotizacionesController = {
  /**
   * Crea una nueva cotización y la relaciona con el paciente
   */
  crear: async (req, res) => {
    try {
      const { nombre, apellido, cedula, email, telefono, fecha_nacimiento, sexo, examenes, tasaCambio } = req.body;

      // Log de información recibida para depuración
      console.log('Datos recibidos:', { 
        nombre, 
        apellido, 
        cedula, 
        email, 
        telefono,
        fecha_nacimiento,
        sexo,
        examenesCantidad: examenes?.length,
        tasaCambio
      });
      
      logGeneral(`🧾 Nueva cotización recibida para: ${nombre} ${apellido} (${cedula})`);

      // Validación exhaustiva de datos
      const errores = [];
      
      if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') 
        errores.push('El nombre es requerido');
      
      if (!apellido || typeof apellido !== 'string' || apellido.trim() === '') 
        errores.push('El apellido es requerido');
      
      if (!cedula || typeof cedula !== 'string' || cedula.trim() === '') 
        errores.push('La cédula es requerida');
      
      if (!email || typeof email !== 'string' || email.trim() === '') 
        errores.push('El email es requerido');
      
      if (!telefono || typeof telefono !== 'string' || telefono.trim() === '') 
        errores.push('El teléfono es requerido');
      
      if (!fecha_nacimiento) 
        errores.push('La fecha de nacimiento es requerida');
      
      if (!sexo || typeof sexo !== 'string' || !['masculino', 'femenino', 'otro'].includes(sexo.toLowerCase())) 
        errores.push('El sexo debe ser masculino, femenino u otro');
        
      if (!examenes || !Array.isArray(examenes) || examenes.length === 0) 
        errores.push('Debe seleccionar al menos un examen');
      
      if (!tasaCambio || isNaN(Number(tasaCambio)) || Number(tasaCambio) <= 0) 
        errores.push('La tasa de cambio es inválida');
      
      // Si hay errores, devolver respuesta de error
      if (errores.length > 0) {
        logGeneral(`❌ Validación fallida: ${errores.join(', ')}`);
        return res.status(400).json({ 
          error: 'Datos incompletos o inválidos', 
          detalles: errores 
        });
      }

      // Todos los datos están correctos, crear la cotización
      const resultado = await CotizacionesModel.crear({
        nombre,
        apellido,
        cedula, 
        email, 
        telefono,
        fecha_nacimiento,
        sexo,
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
      console.error('❌ Error al crear cotización:', err);
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
  }
};

module.exports = CotizacionesController;