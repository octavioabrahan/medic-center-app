import React, { useState, useEffect } from 'react';
import { ArrowLeftIcon, ChevronDownIcon } from '@heroicons/react/20/solid';
import styles from './SeguimientoCotizaciones.module.css';
import Button from '../../../components/Button/Button';
import SelectField from '../../../components/Inputs/SelectField';
import TextAreaField from '../../../components/Inputs/TextAreaField';
import InputField from '../../../components/Inputs/InputField';
import axios from 'axios';

const SeguimientoCotizaciones = ({ cotizacion, onClose }) => {
  // Estados para el formulario de seguimiento
  const [tipoContacto, setTipoContacto] = useState('llamada');
  const [resultado, setResultado] = useState('exitoso');
  const [comentarios, setComentarios] = useState('');
  const [proximaAccion, setProximaAccion] = useState('');
  const [fechaProximaAccion, setFechaProximaAccion] = useState(formatDate(new Date()));
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);

  // API URL
  const API_URL = `${process.env.REACT_APP_API_URL || ''}/api`;

  // Opciones para los select
  const tipoContactoOptions = [
    { value: 'llamada', label: 'Llamada' },
    { value: 'email', label: 'Email' },
    { value: 'visita', label: 'Visita' }
  ];

  const resultadoOptions = [
    { value: 'exitoso', label: 'Exitoso' },
    { value: 'fallido', label: 'Fallido' },
    { value: 'sin_respuesta', label: 'Sin respuesta' }
  ];

  // Formatear fecha para el select
  function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // Generar opciones de fechas para el select (próximos 30 días)
  const getFechasOptions = () => {
    const options = [];
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);
      const formattedDate = formatDate(date);
      options.push({
        value: formattedDate,
        label: formattedDate
      });
    }
    
    return options;
  };

  // Cargar historial de seguimiento al montar el componente
  useEffect(() => {
    // Simulación de historial (en producción, esto vendría de la API)
    // En una implementación real, aquí se haría una petición a la API
    setHistorial([
      {
        tipo_contacto: 'llamada',
        resultado: 'exitoso',
        comentarios: 'Cliente vendrá mañana',
        proxima_accion: 'Esperar al cliente',
        fecha: '26/02/2025'
      }
    ]);
    
    // TODO: Descomentar para implementación real
    /*
    const fetchSeguimiento = async () => {
      try {
        const res = await axios.get(`${API_URL}/seguimiento/${cotizacion.id_cotizacion}`);
        setHistorial(res.data);
      } catch (error) {
        console.error('Error al cargar historial de seguimiento:', error);
      }
    };
    fetchSeguimiento();
    */
  }, [cotizacion]);

  // Manejar guardar nuevo seguimiento
  const handleSaveFollowUp = async () => {
    if (!comentarios || !proximaAccion) {
      // Validación básica
      return;
    }

    setLoading(true);
    
    const seguimientoData = {
      id_cotizacion: cotizacion.id_cotizacion || cotizacion.folio,
      tipo_contacto: tipoContacto,
      resultado: resultado,
      comentarios: comentarios,
      proxima_accion: proximaAccion,
      fecha_proxima_accion: fechaProximaAccion
    };

    try {
      // Para este ejemplo simulamos éxito, pero en producción se enviaría a la API
      console.log('Guardando seguimiento:', seguimientoData);
      
      // Actualizar historial localmente para demo
      setHistorial([
        {
          tipo_contacto: tipoContacto,
          resultado: resultado,
          comentarios: comentarios,
          proxima_accion: proximaAccion,
          fecha: fechaProximaAccion
        },
        ...historial
      ]);
      
      // Limpiar formulario
      setComentarios('');
      setProximaAccion('');
      
      // TODO: Descomentar para implementación real
      /*
      await axios.post(`${API_URL}/seguimiento`, seguimientoData);
      // Recargar historial tras guardar
      const res = await axios.get(`${API_URL}/seguimiento/${cotizacion.id_cotizacion}`);
      setHistorial(res.data);
      */
    } catch (error) {
      console.error('Error al guardar seguimiento:', error);
    } finally {
      setLoading(false);
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

  // Formato para fecha completa
  const formatFullDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.mainContent}>
        <div className={styles.pageHeader}>
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
                  {formatFullDate(cotizacion.fecha_creacion || cotizacion.fecha)}
                </div>
              </div>
              <div className={styles.frame89}>
                <div className={styles.totalUsd}>Total USD</div>
                <div className={styles.totalValue}>
                  ${parseFloat(cotizacion.total_usd || 0).toFixed(2)}
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
                  {cotizacion.items && cotizacion.items.map((item, index) => (
                    <div key={`codigo-${index}`} className={styles.cell}>
                      <div className={styles.text}>
                        <div className={styles.text3}>{item.codigo || '9876'}</div>
                      </div>
                    </div>
                  ))}
                  {/* Si no hay items, mostramos placeholders */}
                  {(!cotizacion.items || cotizacion.items.length === 0) && (
                    <>
                      <div className={styles.cell}>
                        <div className={styles.text}>
                          <div className={styles.text3}>98765432</div>
                        </div>
                      </div>
                      <div className={styles.cell}>
                        <div className={styles.text}>
                          <div className={styles.text3}>98765432</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className={styles.col2}>
                  <div className={styles.headerCell}>
                    <div className={styles.text}>
                      <div className={styles.text2}>Nombre</div>
                    </div>
                  </div>
                  {cotizacion.items && cotizacion.items.map((item, index) => (
                    <div key={`nombre-${index}`} className={styles.cell2}>
                      <div className={styles.text}>
                        <div className={styles.text3}>{item.nombre || 'Servicio'}</div>
                      </div>
                    </div>
                  ))}
                  {(!cotizacion.items || cotizacion.items.length === 0) && (
                    <>
                      <div className={styles.cell2}>
                        <div className={styles.text}>
                          <div className={styles.text3}>Acido úrico</div>
                        </div>
                      </div>
                      <div className={styles.cell2}>
                        <div className={styles.text}>
                          <div className={styles.text3}>Glicemia post pandrial</div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className={styles.col3}>
                  <div className={styles.headerCell}>
                    <div className={styles.text}>
                      <div className={styles.text2}>Precio USD</div>
                    </div>
                  </div>
                  {cotizacion.items && cotizacion.items.map((item, index) => (
                    <div key={`precio-${index}`} className={styles.cell2}>
                      <div className={styles.text4}>
                        <div className={styles.text3}>$ {parseFloat(item.precio_usd || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                  {(!cotizacion.items || cotizacion.items.length === 0) && (
                    <>
                      <div className={styles.cell2}>
                        <div className={styles.text4}>
                          <div className={styles.text3}>$ 00.00</div>
                        </div>
                      </div>
                      <div className={styles.cell2}>
                        <div className={styles.text4}>
                          <div className={styles.text3}>$ 00.00</div>
                        </div>
                      </div>
                    </>
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
                    label="Resultado"
                    value={resultado}
                    options={resultadoOptions}
                    onChange={setResultado}
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
              <Button 
                label="Guardar"
                onClick={handleSaveFollowUp}
                disabled={!comentarios || !proximaAccion}
                loading={loading}
                className={styles.buttonPrimary}
              />
            </div>
            
            {/* Historial de seguimiento */}
            <div className={styles.paciente}>
              <div className={styles.frame88}>
                <div className={styles.historial}>Historial</div>
                <div className={styles.line6}></div>
              </div>
              {historial.length > 0 ? (
                historial.map((item, index) => (
                  <div key={index} className={styles.historialItem}>
                    <div className={styles.frame79}>
                      <div className={styles.tipoDeContacto}>Tipo de contacto</div>
                      <div className={styles.tipoContactoValue}>
                        {item.tipo_contacto.charAt(0).toUpperCase() + item.tipo_contacto.slice(1)}
                      </div>
                    </div>
                    <div className={styles.frame78}>
                      <div className={styles.resultadoLabel}>Resultado</div>
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
                        {item.fecha}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noHistorial}>No hay registros de seguimiento previos.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeguimientoCotizaciones;
