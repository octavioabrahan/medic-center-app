import React, { useState, useEffect } from "react";
import api from "../../../api";

function PantallasAdminTab() {
  const [screens, setScreens] = useState([]);
  const [filteredScreens, setFilteredScreens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentScreen, setCurrentScreen] = useState(null);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    path: "",
    description: "",
    icon: "",
    orden: 0,
    is_active: true
  });

  useEffect(() => {
    fetchScreens();
  }, []);
  
  // Actualizar el formulario cuando cambia la pantalla seleccionada
  useEffect(() => {
    if (currentScreen) {
      setFormData({
        name: currentScreen.name || "",
        path: currentScreen.path || "",
        description: currentScreen.description || "",
        icon: currentScreen.icon || "",
        orden: currentScreen.orden || 0,
        is_active: currentScreen.is_active !== false
      });
    } else {
      setFormData({
        name: "",
        path: "",
        description: "",
        icon: "",
        orden: screens.length + 1,
        is_active: true
      });
    }
  }, [currentScreen, screens.length]);

  // Filtrar pantallas cuando cambia el término de búsqueda
  useEffect(() => {
    if (screens.length > 0) {
      if (searchTerm.trim() === "") {
        setFilteredScreens(screens);
      } else {
        const term = searchTerm.toLowerCase();
        const filtered = screens.filter(screen => 
          screen.name?.toLowerCase().includes(term) ||
          screen.path?.toLowerCase().includes(term) ||
          screen.description?.toLowerCase().includes(term)
        );
        setFilteredScreens(filtered);
      }
    }
  }, [searchTerm, screens]);

  const fetchScreens = async () => {
    setLoading(true);
    try {
      const response = await api.get("/screens");
      const sortedScreens = response.data.sort((a, b) => a.orden - b.orden);
      setScreens(sortedScreens);
      setFilteredScreens(sortedScreens);
      setError(null);
    } catch (err) {
      console.error('Error cargando pantallas:', err);
      setError('No se pudieron cargar las pantallas del sistema');
    } finally {
      setLoading(false);
    }
  };

  const handleEditScreen = (screen) => {
    setCurrentScreen(screen);
    setShowModal(true);
  };

  const handleDeleteScreen = async (screenId) => {
    if (!window.confirm('¿Está seguro que desea eliminar esta pantalla? Esta acción podría afectar a los roles que la tienen asignada.')) {
      return;
    }
    
    try {
      await api.delete(`/screens/${screenId}`);
      fetchScreens();
    } catch (err) {
      console.error('Error eliminando pantalla:', err);
      alert('Error al eliminar la pantalla');
    }
  };

  const handleSaveScreen = async (e) => {
    e.preventDefault();
    
    try {
      if (currentScreen) {
        // Actualizar pantalla existente
        await api.put(`/screens/${currentScreen.id_screen}`, formData);
      } else {
        // Crear nueva pantalla
        await api.post("/screens", formData);
      }
      setShowModal(false);
      fetchScreens();
    } catch (err) {
      console.error('Error guardando pantalla:', err);
      alert('Error al guardar la pantalla');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const renderScreenForm = () => {
    return (
      <form onSubmit={handleSaveScreen} className="screen-form">
        <div className="form-group">
          <label htmlFor="name">Nombre de la Pantalla *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="path">Ruta *</label>
          <input
            type="text"
            id="path"
            name="path"
            value={formData.path}
            onChange={handleChange}
            required
            placeholder="Ejemplo: /admin/pantalla"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Descripción</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
          ></textarea>
        </div>
        
        <div className="form-row">
          <div className="form-group half-width">
            <label htmlFor="icon">Icono</label>
            <input
              type="text"
              id="icon"
              name="icon"
              value={formData.icon}
              onChange={handleChange}
              placeholder="Ej: dashboard"
            />
          </div>
          
          <div className="form-group half-width">
            <label htmlFor="orden">Orden</label>
            <input
              type="number"
              id="orden"
              name="orden"
              value={formData.orden}
              onChange={handleChange}
              min="1"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-container">
            <input
              type="checkbox"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
            />
            <span className="checkbox-text">Pantalla activa</span>
          </label>
        </div>

        <div className="form-buttons">
          <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
            Cancelar
          </button>
          <button type="submit" className="btn-save">
            {currentScreen ? 'Actualizar' : 'Crear'} Pantalla
          </button>
        </div>
      </form>
    );
  };

  const renderScreensTable = () => {
    if (loading) return <div className="loading">Cargando pantallas...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (filteredScreens.length === 0) return <div className="no-results">No se encontraron pantallas</div>;

    return (
      <div className="table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Orden</th>
              <th>Nombre</th>
              <th>Ruta</th>
              <th>Descripción</th>
              <th>Icono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredScreens.map((screen) => (
              <tr key={screen.id_screen}>
                <td>{screen.orden}</td>
                <td>{screen.name}</td>
                <td><code>{screen.path}</code></td>
                <td>{screen.description || '-'}</td>
                <td>{screen.icon || '-'}</td>
                <td>{screen.is_active ? 'Activa' : 'Inactiva'}</td>
                <td className="actions-cell">
                  <button 
                    className="btn-action btn-edit" 
                    title="Editar"
                    onClick={() => handleEditScreen(screen)}
                  >
                    <span className="icon-edit">✏️</span>
                  </button>
                  <button 
                    className="btn-action btn-delete" 
                    title="Eliminar"
                    onClick={() => handleDeleteScreen(screen.id_screen)}
                  >
                    <span className="icon-delete">🗑️</span>
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
    <div>
      <div className="admin-actions">
        <div className="admin-search">
          <input
            type="text"
            placeholder="Buscar pantallas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
        <button className="btn-agregar" onClick={() => {
          setCurrentScreen(null);
          setShowModal(true);
        }}>
          <span className="icon-plus">+</span> Agregar pantalla
        </button>
      </div>
      
      {renderScreensTable()}
      
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <div className="admin-modal-header">
              <h2>{currentScreen ? "Editar pantalla" : "Agregar pantalla"}</h2>
              <button className="admin-close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="admin-modal-body">
              {renderScreenForm()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PantallasAdminTab;