const CotizacionesModel = require('../models/cotizacionesModelRelacional');
const { logGeneral } = require('../utils/logger');

const CotizacionesController = {
  /**
   * Crea una nueva cotización y la relaciona con el paciente
   */
  crear: async (req, res) => {
    try {
      const { nombre, apellido, cedula, email, telefono, fecha_nacimiento, sexo, examenes, tasaCambio } = req.body;

      // ======= DIAGNÓSTICO MEJORADO - Inicio =======
      console.log('🔍 DIAGNÓSTICO: Datos recibidos completos:', JSON.stringify(req.body, null, 2));
      
      // Verificar tipo de datos para cada campo
      console.log('🔍 DIAGNÓSTICO: Tipos de datos:');
      console.log('- nombre:', typeof nombre, nombre);
      console.log('- apellido:', typeof apellido, apellido);
      console.log('- cedula:', typeof cedula, cedula);
      console.log('- email:', typeof email, email);
      console.log('- telefono:', typeof telefono, telefono);
      console.log('- fecha_nacimiento:', typeof fecha_nacimiento, fecha_nacimiento);
      console.log('- sexo:', typeof sexo, sexo);
      console.log('- examenes:', Array.isArray(examenes) ? 'Array' : typeof examenes, examenes?.length);
      console.log('- tasaCambio:', typeof tasaCambio, tasaCambio);
      
      if (examenes && Array.isArray(examenes)) {
        console.log('🔍 DIAGNÓSTICO: Primer examen:', JSON.stringify(examenes[0], null, 2));
      }
      // ======= DIAGNÓSTICO MEJORADO - Fin =======

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
        console.log('🔍 DIAGNÓSTICO: Errores de validación encontrados:', errores);
        logGeneral(`❌ Validación fallida: ${errores.join(', ')}`);
        return res.status(400).json({ 
          error: 'Datos incompletos o inválidos', 
          detalles: errores 
        });
      }

      console.log('🔍 DIAGNÓSTICO: Validación inicial pasada, procesando datos...');

      // Conversión explícita de tipos para evitar problemas
      const datosFormateados = {
        nombre: String(nombre).trim(),
        apellido: String(apellido).trim(),
        cedula: String(cedula).trim(),
        email: String(email).trim(),
        telefono: String(telefono).trim(),
        fecha_nacimiento: fecha_nacimiento,
        sexo: String(sexo).toLowerCase(),
        examenes: examenes.map(examen => ({
          codigo: String(examen.codigo),
          nombre: String(examen.nombre),
          precio: Number(examen.precio),
          tiempo_entrega: examen.tiempo_entrega ? String(examen.tiempo_entrega) : null
        })),
        tasaCambio: Number(tasaCambio)
      };

      console.log('🔍 DIAGNÓSTICO: Datos formateados:', JSON.stringify(datosFormateados, null, 2));

      // Todos los datos están correctos, crear la cotización
      try {
        console.log('🔍 DIAGNÓSTICO: Llamando a CotizacionesModel.crear()');
        const resultado = await CotizacionesModel.crear(datosFormateados);
        console.log('🔍 DIAGNÓSTICO: Cotización creada exitosamente:', resultado);
        
        // Generar PDF y enviar correo
        const nombreCompleto = `${datosFormateados.nombre} ${datosFormateados.apellido}`;
        
        try {
          console.log('🔍 DIAGNÓSTICO: Intentando procesar documentos...');
          const docResults = await CotizacionesModel.procesarDocumentos(
            resultado.id,
            nombreCompleto, 
            datosFormateados.email
          );
          console.log('🔍 DIAGNÓSTICO: Documentos procesados exitosamente:', docResults);
          
          res.json({ 
            id: resultado.id,
            cedula: resultado.cedula,
            emailEnviado: docResults.enviado,
            totalUSD: resultado.totalUSD,
            totalVES: resultado.totalVES
          });
        } catch (docError) {
          console.error('🔍 DIAGNÓSTICO: Error al procesar documentos:', docError);
          // Aún si falla la generación de PDF, consideramos exitosa la cotización
          res.json({ 
            id: resultado.id,
            cedula: resultado.cedula,
            emailEnviado: false,
            error_documentos: docError.message,
            totalUSD: resultado.totalUSD,
            totalVES: resultado.totalVES
          });
        }
      } catch (modelError) {
        console.error('🔍 DIAGNÓSTICO: Error en el modelo al crear cotización:', modelError);
        throw modelError; // Relanzar para que lo maneje el catch principal
      }
    } catch (err) {
      console.error('❌ Error al crear cotización:', err);
      console.error('🔍 DIAGNÓSTICO: Error detallado:', err.message);
      console.error('🔍 DIAGNÓSTICO: Stack de error:', err.stack);
      
      // Mostrar información más detallada sobre el error
      logGeneral(`❌ Error al crear cotización: ${err.message}`);
      res.status(500).json({ 
        error: 'Error al crear cotización', 
        detalle: err.message,
        stack: err.stack,
        origen: err.name || 'Desconocido'
      });
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