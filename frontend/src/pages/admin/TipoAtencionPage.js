import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../components/admin/AdminCommon.css"; // Importamos los estilos comunes

function TipoAtencionPage() {
  const [tiposAtencion, setTiposAtencion] = useState([]);
  const [filteredTipos, setFilteredTipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentTipo, setCurrentTipo] = useState(null);
  const [nuevoTipo, setNuevoTipo] = useState({ nombre: "" });

  useEffect(() => {
    fetchTiposAtencion();
  }, []);

  // Filtrar tipos cuando cambia el término de búsqueda
  useEffect(() => {
    if (tiposAtencion.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredTipos(tiposAtencion);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = tiposAtencion.filter(tipo => 
          tipo.nombre.toLowerCase().includes(term)
        );
        setFilteredTipos(filtered);
      }
    }
  }, [searchTerm, tiposAtencion]);

  const fetchTiposAtencion = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/tipo-atencion");
      setTiposAtencion(response.data);
      setFilteredTipos(response.data);
    } catch (err) {
      console.error('Error:', err);
      setError('No se pudieron cargar los tipos de atención. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditTipo = (tipo) => {
    setCurrentTipo(tipo);
    setNuevoTipo({ nombre: tipo.nombre });
    setShowModal(true);
  };

  const handleCreateTipo = () => {
    setCurrentTipo(null);
    setNuevoTipo({ nombre: "" });
    setShowModal(true);
  };

  const handleDeleteTipo = async (tipoId) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este tipo de atención?')) {
      try {
        await axios.delete(`/api/tipo-atencion/${tipoId}`);
        fetchTiposAtencion();
      } catch (err) {
        console.error('Error eliminando tipo de atención:', err);
        alert('Hubo un error al eliminar el tipo de atención');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!nuevoTipo.nombre.trim()) {
      alert('El nombre del tipo de atención es obligatorio');
      return;
    }

    try {
      if (currentTipo) {
        // Actualizar tipo existente
        await axios.put(`/api/tipo-atencion/${currentTipo.id}`, nuevoTipo);
      } else {
        // Crear nuevo tipo
        await axios.post('/api/tipo-atencion', nuevoTipo);
      }
      
      setShowModal(false);
      setNuevoTipo({ nombre: '' });
      fetchTiposAtencion();
      
    } catch (err) {
      console.error('Error:', err);
      alert(`Error al ${currentTipo ? 'actualizar' : 'crear'} el tipo de atención.`);
    }
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Gestión de Tipos de Atención</h1>
      
      <div className="admin-filters-bar">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        
        <button className="btn-add" onClick={handleCreateTipo}>
          Agregar tipo de atención
        </button>
      </div>
      
      {loading ? (
        <div className="loading-container">Cargando tipos de atención...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : filteredTipos.length === 0 ? (
        <div className="no-results">No se encontraron tipos de atención</div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredTipos.map((tipo) => (
                <tr key={tipo.id}>
                  <td>{tipo.nombre}</td>
                  <td className="actions-cell">
                    <button 
                      className="btn-action btn-edit" 
                      title="Editar"
                      onClick={() => handleEditTipo(tipo)}
                    >
                      ✏️
                    </button>
                    <button 
                      className="btn-action btn-delete" 
                      title="Eliminar"
                      onClick={() => handleDeleteTipo(tipo.id)}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal para añadir/editar tipo de atención */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{currentTipo ? "Editar tipo de atención" : "Agregar tipo de atención"}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del tipo de atención</label>
                  <input
                    id="nombre"
                    type="text"
                    value={nuevoTipo.nombre}
                    onChange={(e) => setNuevoTipo({ ...nuevoTipo, nombre: e.target.value })}
                    required
                  />
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                Cancelar
              </button>
              <button type="button" className="btn-primary" onClick={handleSubmit}>
                {currentTipo ? "Actualizar" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TipoAtencionPage;
