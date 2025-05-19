import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/20/solid';
import styles from './SeguimientoCotizaciones.module.css';
import Button from '../../../components/Button/Button';
import SelectField from '../../../components/Inputs/SelectField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import InputField from '../../../components/Inputs/InputField';
import Table from '../../../components/Tables/Table';
import axios from 'axios';

const SeguimientoCotizaciones = ({ cotizacion, onClose }) => {
  // Estados para el formulario de seguimiento
  const [tipoContacto, setTipoContacto] = useState('llamada');
  const [estado, setEstado] = useState('pendiente');
  const [comentarios, setComentarios] = useState('');
  const [proximaAccion, setProximaAccion] = useState('');
  const [fechaProximaAccion, setFechaProximaAccion] = useState(new Date().toISOString().split('T')[0]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // API URL
  const API_URL = `${process.env.REACT_APP_API_URL || ''}/api`;

  // Opciones para los select
  const tipoContactoOptions = [
    { value: 'llamada', label: 'Llamada' },
    { value: 'email', label: 'Email' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'presencial', label: 'Presencial' }
  ];

  const estadoOptions = [
    { value: 'pendiente', label: 'Pendiente' },
    { value: 'confirmado', label: 'Confirmado' },
    { value: 'cancelado', label: 'Cancelado' }
  ];

  // Formatear fecha para el select
  function formatDate(date) {
    if (!date) return '';
    try {
      if (typeof date === 'string') {
        date = new Date(date);
      }
      if (isNaN(date.getTime())) return '';
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return '';
    }
  }

  // Formatear fecha para mostrar
  function formatDisplayDate(dateString) {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    } catch (error) {
      console.error("Error al formatear fecha para mostrar:", error);
      return 'Error de formato';
    }
  }

  // Generar opciones de fechas para el select (próximos 30 días)
  const getFechasOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const formattedDate = formatDate(date);
      const displayDate = date.toLocaleDateString();
      options.push({
        value: formattedDate,
        label: displayDate
      });
    }
    
    return options;
  };

  // Cargar historial de seguimiento al montar el componente
  useEffect(() => {
    if (cotizacion && cotizacion.id_unico) {
      fetchSeguimientos(cotizacion.id_unico);
    }
  }, [cotizacion]);

  // Obtener seguimientos desde la API
  const fetchSeguimientos = async (id) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/seguimiento/cotizacion/${id}`);
      setHistorial(response.data);
      setError(null);
    } catch (err) {
      console.error('Error al cargar historial de seguimiento:', err);
      setError('No se pudieron cargar los seguimientos.');
      setHistorial([]);
    } finally {
      setLoading(false);
    }
  };

  // Manejar guardar nuevo seguimiento
  const handleSaveFollowUp = async () => {
    if (!comentarios || !proximaAccion) {
      // Validación básica
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    setLoading(true);
    setError(null);
    
    const seguimientoData = {
      cotizacion_id: cotizacion.id_unico,
      tipo_contacto: tipoContacto,
      resultado: estado, // Enviamos el estado como resultado para mantener compatibilidad con la API
      comentarios: comentarios,
      usuario: 'admin', // En un sistema real, esto vendría del sistema de autenticación
      proxima_accion: proximaAccion,
      fecha_proxima_accion: fechaProximaAccion
    };

    console.log('Enviando seguimiento:', seguimientoData);

    try {
      // Paso 1: Guardar el seguimiento
      const seguimientoResponse = await axios.post(`${API_URL}/seguimiento`, seguimientoData);
      console.log('Seguimiento guardado:', seguimientoResponse.data);
      
      // Paso 2: Actualizar el estado de la cotización
      await updateCotizacionStatus(cotizacion.id_unico, estado);
      
      // Paso 3: Recargar el historial actualizado
      await fetchSeguimientos(cotizacion.id_unico);
      
      // Paso 4: Limpiar el formulario
      setComentarios('');
      setProximaAccion('');
      
      // Mostrar mensaje de éxito temporalmente
      setError(null);
    } catch (error) {
      console.error('Error al guardar seguimiento:', error);
      setError('Error al guardar seguimiento. Por favor, intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Actualizar estado de cotización
  const updateCotizacionStatus = async (id, newStatus) => {
    try {
      // Actualiza el estado en la tabla de cotizaciones
      const response = await axios.patch(`${API_URL}/cotizaciones/${id}`, { 
        estado: newStatus
      });
      console.log('Estado de cotización actualizado:', response.data);
      
      // Actualiza también el estado en la cotización actual
      if (cotizacion) {
        cotizacion.estado = newStatus;
      }
    } catch (err) {
      console.error('Error al actualizar estado:', err);
      setError('Error al actualizar el estado de la cotización.');
    }
  };

  // Obtener estado formateado para mostrar como tag
  const getStatusTag = () => {
    const estado = cotizacion.estado || 'pendiente';
    let scheme;
    
    switch (estado) {
      case 'confirmado':
        scheme = 'positive';
        break;
      case 'pendiente':
        scheme = 'warning';
        break;
      case 'cancelado':
        scheme = 'danger';
        break;
      default:
        scheme = 'neutral';
    }
    
    return (
      <div className={`${styles.tag} ${styles[scheme]}`}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </div>
    );
  };

  // Formatear número de manera segura
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '0.00';
    if (typeof num === 'string') num = parseFloat(num);
    if (isNaN(num)) return '0.00';
    return num.toFixed(2);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.mainContent}>          <div className={styles.pageHeader}>
            <div className={styles.iconButton} onClick={onClose}>
              <ArrowLeftIcon className={styles.arrowLeft} width={20} height={20} />
            </div>
            <div className={styles.menuHeader}>
              <div className={styles.textStrong}>
                Detalle de la cotización
              </div>
              {getStatusTag()}
            </div>
          </div>

          <div className={styles.frame93}>
            {/* Primera columna - Información de cotización */}
            <div className={styles.cotizacionCard}>
              <div className={styles.infoCotizacion}>
                <div className={styles.frame88}>
                  <div className={styles.informacionDeLaCotizacion}>
                    Información de la cotización
                  </div>
                  <div className={styles.line6}></div>
                </div>
                <div className={styles.frame78}>
                  <div className={styles.folio}>Folio</div>
                  <div className={styles.cotFolio}>
                    {cotizacion.folio || 'COT-0000-0000'}
                  </div>
                </div>
                <div className={styles.frame79}>
                  <div className={styles.fecha}>Fecha</div>
                  <div className={styles.fechaText}>
                    {formatDisplayDate(cotizacion.fecha_creacion || cotizacion.fecha)}
                  </div>
                </div>
                <div className={styles.frame89}>
                  <div className={styles.totalUsd}>Total USD</div>
                  <div className={styles.totalValue}>
                    ${formatNumber(cotizacion.total_usd || 0)}
                  </div>
                </div>
              
              {/* Tabla de servicios/productos */}
              <div className={styles.contentTable}>
                <div className={styles.col}>
                  <div className={styles.headerCell}>
                    <div className={styles.text}>
                      <div className={styles.text2}>Código</div>
                    </div>
                  </div>
                  {Array.isArray(cotizacion.examenes) && cotizacion.examenes.length > 0 ? (
                    cotizacion.examenes.map((exam, index) => (
                      <div key={`codigo-${index}`} className={styles.cell}>
                        <div className={styles.text}>
                          <div className={styles.text3}>{exam.examen_codigo || '-'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.cell}>
                      <div className={styles.text}>
                        <div className={styles.text3}>No hay exámenes</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.col2}>
                  <div className={styles.headerCell}>
                    <div className={styles.text}>
                      <div className={styles.text2}>Nombre</div>
                    </div>
                  </div>
                  {Array.isArray(cotizacion.examenes) && cotizacion.examenes.length > 0 ? (
                    cotizacion.examenes.map((exam, index) => (
                      <div key={`nombre-${index}`} className={styles.cell2}>
                        <div className={styles.text}>
                          <div className={styles.text3}>{exam.nombre_examen || '-'}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.cell2}>
                      <div className={styles.text}>
                        <div className={styles.text3}>Sin datos</div>
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.col3}>
                  <div className={styles.headerCell}>
                    <div className={styles.text}>
                      <div className={styles.text2}>Precio USD</div>
                    </div>
                  </div>
                  {Array.isArray(cotizacion.examenes) && cotizacion.examenes.length > 0 ? (
                    cotizacion.examenes.map((exam, index) => (
                      <div key={`precio-${index}`} className={styles.cell2}>
                        <div className={styles.text4}>
                          <div className={styles.text3}>$ {formatNumber(exam.precio_unitario || 0)}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={styles.cell2}>
                      <div className={styles.text4}>
                        <div className={styles.text3}>$ 0.00</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className={styles.infoDelCotizante}>
              <div className={styles.paciente}>
                <div className={styles.frame88}>
                  <div className={styles.informacionDelCotizante}>
                    Información del cotizante
                  </div>
                  <div className={styles.line6}></div>
                </div>
                <div className={styles.frame78}>
                  <div className={styles.nombre}>Nombre</div>
                  <div className={styles.nombreCliente}>
                    {`${cotizacion.nombre || ''} ${cotizacion.apellido || ''}`}
                  </div>
                </div>
                <div className={styles.frame79}>
                  <div className={styles.cedula}>Cédula</div>
                  <div className={styles.cedulaCliente}>
                    {cotizacion.cedula_cliente || 'No disponible'}
                  </div>
                </div>
                <div className={styles.frame90}>
                  <div className={styles.telefono}>Teléfono</div>
                  <div className={styles.telefonoCliente}>
                    {cotizacion.telefono || 'No aplica'}
                  </div>
                </div>
                <div className={styles.frame81}>
                  <div className={styles.correoElectronico}>Correo electrónico</div>
                  <div className={styles.correoCliente}>
                    {cotizacion.email || 'No aplica'}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Segunda columna - Seguimiento */}
          <div className={styles.cotizacionCard}>
            <div className={styles.paciente2}>
              <div className={styles.frame88}>
                <div className={styles.nuevoSeguimiento}>Nuevo seguimiento</div>
                <div className={styles.line6}></div>
              </div>
              <div className={styles.frame91}>
                <div className={styles.selectField}>
                  <SelectField
                    label="Tipo de contacto"
                    value={tipoContacto}
                    options={tipoContactoOptions}
                    onChange={setTipoContacto}
                  />
                </div>
                <div className={styles.selectField}>
                  <SelectField
                    label="Estado"
                    value={estado}
                    options={estadoOptions}
                    onChange={setEstado}
                  />
                </div>
              </div>
              <div className={styles.textareaField}>
                <TextAreaField
                  label="Comentarios"
                  value={comentarios}
                  onChange={setComentarios}
                  placeholder="Detalle de la comunicación"
                />
              </div>
              <div className={styles.frame92}>
                <div className={styles.inputField}>
                  <InputField
                    label="Próxima acción"
                    value={proximaAccion}
                    onChange={setProximaAccion}
                    placeholder="Ejemplo: Volver a llamar, enviar recordatorio..."
                  />
                </div>
                <div className={styles.selectField}>
                  <SelectField
                    label="Fecha de la próxima acción"
                    value={fechaProximaAccion}
                    options={getFechasOptions()}
                    onChange={setFechaProximaAccion}
                  />
                </div>
              </div>
              {error && <div className={styles.errorMessage}>{error}</div>}
              <div className={styles.buttonContainer}>
                <Button 
                  label="Guardar"
                  onClick={handleSaveFollowUp}
                  disabled={!comentarios || !proximaAccion || loading}
                  loading={loading}
                  className={styles.buttonNeutral}
                  variant="neutral"
                  size="md"
                />
              </div>
            </div>
            
            {/* Historial de seguimiento */}
            <div className={styles.paciente}>
              <div className={styles.frame88}>
                <div className={styles.historial}>Historial</div>
                <div className={styles.line6}></div>
              </div>
              {loading ? (
                <div className={styles.loadingMessage}>Cargando historial...</div>
              ) : error ? (
                <div className={styles.errorMessage}>{error}</div>
              ) : !Array.isArray(historial) || historial.length === 0 ? (
                <div className={styles.noHistorial}>No hay registros de seguimiento previos.</div>
              ) : (
                <div className={styles.historialScrollable}>
                  {historial.map((item, index) => (
                    <div key={index} className={styles.historialItem}>
                      <div className={styles.frame79}>
                        <div className={styles.tipoDeContacto}>Tipo de contacto</div>
                        <div className={styles.tipoContactoValue}>
                          {item.tipo_contacto.charAt(0).toUpperCase() + item.tipo_contacto.slice(1)}
                        </div>
                      </div>
                      <div className={styles.frame78}>
                        <div className={styles.resultadoLabel}>Estado</div>
                        <div className={styles.resultadoValue}>
                          {item.resultado.charAt(0).toUpperCase() + item.resultado.slice(1)}
                        </div>
                      </div>
                      <div className={styles.frame89}>
                        <div className={styles.comentariosLabel}>Comentarios</div>
                        <div className={styles.comentariosValue}>
                          {item.comentarios}
                        </div>
                      </div>
                      <div className={styles.frame90}>
                        <div className={styles.proximaAccionLabel}>Próxima acción</div>
                        <div className={styles.proximaAccionValue}>
                          {item.proxima_accion}
                        </div>
                      </div>
                      <div className={styles.frame912}>
                        <div className={styles.fechaLabel}>Fecha</div>
                        <div className={styles.fechaValue}>
                          {formatDisplayDate(item.fecha_seguimiento)}
                        </div>
                      </div>
                      <div className={styles.frame912}>
                        <div className={styles.fechaLabel}>Usuario</div>
                        <div className={styles.fechaValue}>
                          {item.usuario || 'Sistema'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoCotizaciones;
