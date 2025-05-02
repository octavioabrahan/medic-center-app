import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ProfesionalesAdmin.css';

function ProfesionalesAdmin() {
  // Estados para datos
  const [profesionales, setProfesionales] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfesionales, setFilteredProfesionales] = useState([]);
  const [especialidadFiltro, setEspecialidadFiltro] = useState('');
  const [ordenamiento, setOrdenamiento] = useState('reciente'); // 'reciente', 'antiguo', 'az', 'za'

  // Estados para modales
  const [showAddEspecialidadModal, setShowAddEspecialidadModal] = useState(false);
  const [showAddProfesionalModal, setShowAddProfesionalModal] = useState(false);
  const [showEditProfesionalModal, setShowEditProfesionalModal] = useState(false);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState({ nombre: '' });
  const [currentProfesional, setCurrentProfesional] = useState(null);

  // Estado para el nuevo profesional
  const [nuevoProfesional, setNuevoProfesional] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    telefono: '',
    correo: '',
    especialidad_id: '',
    servicios: []
  });

  // Fetch de profesionales y especialidades al cargar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profesionalesRes, especialidadesRes] = await Promise.all([
          axios.get('/api/profesionales'),
          axios.get('/api/especialidades')
        ]);
        
        setProfesionales(profesionalesRes.data);
        setFilteredProfesionales(profesionalesRes.data);
        setEspecialidades(especialidadesRes.data);
      } catch (err) {
        console.error('Error:', err);
        setError('Error al cargar datos. Por favor, intenta de nuevo.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Aplicar filtros y ordenamiento a la lista de profesionales
  useEffect(() => {
    if (profesionales.length > 0) {
      let results = [...profesionales];
      
      // Filtrar por término de búsqueda
      if (searchTerm) {
        results = results.filter(profesional =>
          `${profesional.nombre} ${profesional.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          profesional.cedula?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Filtrar por especialidad
      if (especialidadFiltro) {
        results = results.filter(
          profesional => profesional.nombre_especialidad === especialidadFiltro
        );
      }
      
      // Aplicar ordenamiento
      switch (ordenamiento) {
        case 'reciente':
          // Asumiendo que hay una propiedad de fecha de creación o ID incremental
          // Si no hay fecha de creación, mantenemos el orden actual
          break;
        case 'antiguo':
          // Invertimos el orden de "reciente"
          results = [...results].reverse();
          break;
        case 'az':
          results = [...results].sort((a, b) => 
            `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`)
          );
          break;
        case 'za':
          results = [...results].sort((a, b) => 
            `${b.nombre} ${b.apellido}`.localeCompare(`${a.nombre} ${a.apellido}`)
          );
          break;
        default:
          break;
      }
      
      setFilteredProfesionales(results);
    }
  }, [searchTerm, profesionales, especialidadFiltro, ordenamiento]);

  // Crear nueva especialidad
  const handleCreateEspecialidad = async (e) => {
    e.preventDefault();
    if (!nuevaEspecialidad.nombre.trim()) {
      alert('El nombre de la especialidad es obligatorio');
      return;
    }

    try {
      await axios.post('/api/especialidades', nuevaEspecialidad);
      const response = await axios.get('/api/especialidades');
      setEspecialidades(response.data);
      setShowAddEspecialidadModal(false);
      setNuevaEspecialidad({ nombre: '' });
    } catch (err) {
      console.error('Error al crear especialidad:', err);
      alert('Error al crear la especialidad. Por favor, intenta de nuevo.');
    }
  };

  // Crear nuevo profesional
  const handleCreateProfesional = async (e) => {
    e.preventDefault();
    
    if (!nuevoProfesional.cedula || 
        !nuevoProfesional.nombre || 
        !nuevoProfesional.apellido || 
        !nuevoProfesional.especialidad_id) {
      alert('Los campos Cédula, Nombre, Apellido y Especialidad son obligatorios');
      return;
    }

    try {
      // 1. Crear el profesional
      const res = await axios.post('/api/profesionales', {
        cedula: nuevoProfesional.cedula,
        nombre: nuevoProfesional.nombre,
        apellido: nuevoProfesional.apellido,
        especialidad_id: nuevoProfesional.especialidad_id,
        telefono: nuevoProfesional.telefono,
        correo: nuevoProfesional.correo
      });

      // Actualizar la lista de profesionales
      const updatedProfesionales = await axios.get('/api/profesionales');
      setProfesionales(updatedProfesionales.data);
      setFilteredProfesionales(updatedProfesionales.data);
      
      // Cerrar modal y resetear formulario
      setShowAddProfesionalModal(false);
      setNuevoProfesional({
        cedula: '',
        nombre: '',
        apellido: '',
        telefono: '',
        correo: '',
        especialidad_id: '',
        servicios: []
      });

      // Mostrar mensaje de éxito
      const messageElement = document.querySelector('.profesional-agregado-message');
      if (messageElement) {
        messageElement.style.display = 'block';
        setTimeout(() => {
          messageElement.style.display = 'none';
        }, 3000);
      }
      
    } catch (err) {
      console.error('Error al crear profesional:', err);
      alert('Error al crear el profesional. Por favor, intenta de nuevo.');
    }
  };

  // Editar profesional
  const handleEditProfesional = (profesional) => {
    setCurrentProfesional(profesional);
    setShowEditProfesionalModal(true);
  };

  // Guardar edición de profesional
  const handleUpdateProfesional = async (e) => {
    e.preventDefault();
    
    if (!currentProfesional.nombre || 
        !currentProfesional.apellido || 
        !currentProfesional.especialidad_id) {
      alert('Los campos Nombre, Apellido y Especialidad son obligatorios');
      return;
    }

    try {
      // Implementar lógica de actualización aquí usando el ID del profesional
      await axios.put(`/api/profesionales/${currentProfesional.profesional_id}`, {
        nombre: currentProfesional.nombre,
        apellido: currentProfesional.apellido,
        especialidad_id: currentProfesional.especialidad_id,
        telefono: currentProfesional.telefono,
        correo: currentProfesional.correo
      });

      // Actualizar la lista de profesionales
      const updatedProfesionales = await axios.get('/api/profesionales');
      setProfesionales(updatedProfesionales.data);
      setFilteredProfesionales(updatedProfesionales.data);
      
      // Cerrar modal
      setShowEditProfesionalModal(false);
      setCurrentProfesional(null);
      
    } catch (err) {
      console.error('Error al actualizar profesional:', err);
      alert('Error al actualizar el profesional. Por favor, intenta de nuevo.');
    }
  };

  // Modal para añadir especialidad
  const renderAddEspecialidadModal = () => {
    if (!showAddEspecialidadModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Crear especialidad</h2>
            <button className="close-btn" onClick={() => setShowAddEspecialidadModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleCreateEspecialidad}>
              <div className="form-group">
                <label htmlFor="nombre">Nombre de la especialidad</label>
                <input
                  id="nombre"
                  type="text"
                  value={nuevaEspecialidad.nombre}
                  onChange={(e) => setNuevaEspecialidad({ ...nuevaEspecialidad, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={() => setShowAddEspecialidadModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Modal para añadir profesional
  const renderAddProfesionalModal = () => {
    if (!showAddProfesionalModal) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Agregar nuevo profesional</h2>
            <button className="close-btn" onClick={() => setShowAddProfesionalModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleCreateProfesional}>
              <div className="form-group">
                <label htmlFor="cedula">Cédula</label>
                <input
                  id="cedula"
                  type="text"
                  value={nuevoProfesional.cedula}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, cedula: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="nombre">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  value={nuevoProfesional.nombre}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, nombre: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="apellido">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  value={nuevoProfesional.apellido}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, apellido: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="telefono">Teléfono</label>
                <input
                  id="telefono"
                  type="text"
                  value={nuevoProfesional.telefono}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, telefono: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="correo">Correo electrónico</label>
                <input
                  id="correo"
                  type="email"
                  value={nuevoProfesional.correo}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, correo: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label htmlFor="especialidad">Especialidad</label>
                <select
                  id="especialidad"
                  value={nuevoProfesional.especialidad_id}
                  onChange={(e) => setNuevoProfesional({ ...nuevoProfesional, especialidad_id: e.target.value })}
                  required
                >
                  <option value="">Selecciona una especialidad</option>
                  {especialidades.map((esp) => (
                    <option key={esp.especialidad_id} value={esp.especialidad_id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group servicio-group">
                <label>Servicio</label>
                <div className="checkbox-group">
                  <div className="checkbox-item">
                    <input 
                      type="checkbox"
                      id="eco-doppler"
                      name="servicios"
                      value="ECO-DOPPLER CAROTIDEO"
                      onChange={(e) => {
                        const { value } = e.target;
                        if (e.target.checked) {
                          setNuevoProfesional({
                            ...nuevoProfesional,
                            servicios: [...nuevoProfesional.servicios, value]
                          });
                        } else {
                          setNuevoProfesional({
                            ...nuevoProfesional,
                            servicios: nuevoProfesional.servicios.filter(s => s !== value)
                          });
                        }
                      }}
                    />
                    <label htmlFor="eco-doppler">ECO-DOPPLER CAROTIDEO</label>
                  </div>
                  <div className="checkbox-item">
                    <input 
                      type="checkbox"
                      id="triplex-arterial"
                      name="servicios"
                      value="TRIPLEX ARTERIAL DE MIEMBROS INFERIOR"
                      onChange={(e) => {
                        const { value } = e.target;
                        if (e.target.checked) {
                          setNuevoProfesional({
                            ...nuevoProfesional,
                            servicios: [...nuevoProfesional.servicios, value]
                          });
                        } else {
                          setNuevoProfesional({
                            ...nuevoProfesional,
                            servicios: nuevoProfesional.servicios.filter(s => s !== value)
                          });
                        }
                      }}
                    />
                    <label htmlFor="triplex-arterial">TRIPLEX ARTERIAL DE MIEMBROS INFERIOR</label>
                  </div>
                </div>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={() => setShowAddProfesionalModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Modal para editar profesional
  const renderEditProfesionalModal = () => {
    if (!showEditProfesionalModal || !currentProfesional) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h2>Editar profesional</h2>
            <button className="close-btn" onClick={() => setShowEditProfesionalModal(false)}>×</button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleUpdateProfesional}>
              <div className="form-group">
                <label htmlFor="edit-cedula">Cédula</label>
                <input
                  id="edit-cedula"
                  type="text"
                  value={currentProfesional.cedula || ''}
                  onChange={(e) => setCurrentProfesional({...currentProfesional, cedula: e.target.value})}
                  disabled
                />
                <small className="form-text text-muted">La cédula no se puede modificar.</small>
              </div>
              <div className="form-group">
                <label htmlFor="edit-nombre">Nombre</label>
                <input
                  id="edit-nombre"
                  type="text"
                  value={currentProfesional.nombre || ''}
                  onChange={(e) => setCurrentProfesional({...currentProfesional, nombre: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-apellido">Apellido</label>
                <input
                  id="edit-apellido"
                  type="text"
                  value={currentProfesional.apellido || ''}
                  onChange={(e) => setCurrentProfesional({...currentProfesional, apellido: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-telefono">Teléfono</label>
                <input
                  id="edit-telefono"
                  type="text"
                  value={currentProfesional.telefono || ''}
                  onChange={(e) => setCurrentProfesional({...currentProfesional, telefono: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-correo">Correo electrónico</label>
                <input
                  id="edit-correo"
                  type="email"
                  value={currentProfesional.correo || ''}
                  onChange={(e) => setCurrentProfesional({...currentProfesional, correo: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label htmlFor="edit-especialidad">Especialidad</label>
                <select
                  id="edit-especialidad"
                  value={currentProfesional.especialidad_id || ''}
                  onChange={(e) => setCurrentProfesional({...currentProfesional, especialidad_id: e.target.value})}
                  required
                >
                  <option value="">Selecciona una especialidad</option>
                  {especialidades.map((esp) => (
                    <option key={esp.especialidad_id} value={esp.especialidad_id}>
                      {esp.nombre}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-actions">
                <button type="button" className="btn-cancelar" onClick={() => setShowEditProfesionalModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-guardar">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  };

  // Renderizar tabla de profesionales
  const renderProfesionalesTable = () => {
    if (loading) return <div className="loading">Cargando profesionales...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredProfesionales.length === 0) return <div className="no-results">No se encontraron profesionales</div>;

    return (
      <div className="table-container">
        <table className="profesionales-table">
          <thead>
            <tr>
              <th>Cédula</th>
              <th>Profesional</th>
              <th>Especialidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProfesionales.map(profesional => (
              <tr key={profesional.profesional_id}>
                <td>{profesional.cedula}</td>
                <td>{profesional.nombre} {profesional.apellido}</td>
                <td>{profesional.nombre_especialidad}</td>
                <td className="actions-cell">
                  <button 
                    className="btn-action btn-edit" 
                    title="Editar profesional"
                    onClick={() => handleEditProfesional(profesional)}
                  >
                    ✏️
                  </button>
                  <Link 
                    to={`/admin/profesionales/${profesional.profesional_id}/editar-servicios`} 
                    className="btn-action btn-servicios"
                    title="Editar servicios"
                  >
                    🛠️
                  </Link>
                  <button className="btn-action btn-delete" title="Eliminar profesional">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="profesionales-admin">
      <h1>Gestión de Profesionales</h1>
      
      <div className="filters-bar">
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-button">
            <i className="search-icon">🔍</i>
          </button>
        </div>
        
        <div className="filter-container">
          <select 
            value={especialidadFiltro}
            onChange={(e) => setEspecialidadFiltro(e.target.value)}
            className="especialidad-filter"
          >
            <option value="">Todas las especialidades</option>
            {especialidades.map(esp => (
              <option key={esp.especialidad_id} value={esp.nombre}>
                {esp.nombre}
              </option>
            ))}
          </select>
        </div>
        
        <div className="sort-container">
          <button 
            className={`sort-btn ${ordenamiento === 'reciente' ? 'active' : ''}`}
            onClick={() => setOrdenamiento('reciente')}
          >
            Más reciente
          </button>
          <button 
            className={`sort-btn ${ordenamiento === 'antiguo' ? 'active' : ''}`}
            onClick={() => setOrdenamiento('antiguo')}
          >
            Más antiguo
          </button>
          <button 
            className={`sort-btn icon-btn ${ordenamiento === 'az' ? 'active' : ''}`}
            onClick={() => setOrdenamiento('az')}
          >
            <span className="check-icon">✓</span> A → Z
          </button>
          <button 
            className={`sort-btn icon-btn ${ordenamiento === 'za' ? 'active' : ''}`}
            onClick={() => setOrdenamiento('za')}
          >
            Z → A
          </button>
        </div>
        
        <div className="actions-container">
          <button 
            className="btn-crear-especialidad" 
            onClick={() => setShowAddEspecialidadModal(true)}
          >
            Crear especialidad
          </button>
          
          <button 
            className="btn-agregar-profesional" 
            onClick={() => setShowAddProfesionalModal(true)}
          >
            <span className="icon-plus">+</span>
            Agregar nuevo profesional
          </button>
        </div>
      </div>
      
      {renderProfesionalesTable()}
      {renderAddEspecialidadModal()}
      {renderAddProfesionalModal()}
      {renderEditProfesionalModal()}
      
      <div className="profesional-agregado-message" style={{display: 'none'}}>
        <div className="message-content">
          <span className="icon-check">✓</span>
          Profesional agregado
        </div>
      </div>
    </div>
  );
}

export default ProfesionalesAdmin;