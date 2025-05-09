import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AdminLayout } from '../../components/layouts';
import styles from './EmpresasPage.module.css';

/**
 * Página para la gestión de empresas con convenio
 */
const EmpresasPage = () => {
  // Estados para manejar datos y UI
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState({
    nombre: "",
    ruc: "",
    contacto: "",
    email: "",
    telefono: "",
    direccion: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  
  // Cargar las empresas al iniciar
  const fetchEmpresas = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/empresas');
      setEmpresas(response.data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar empresas:", err);
      setError("Error al cargar las empresas. Por favor, inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmpresas();
  }, [fetchEmpresas]);

  // Filtrar empresas según término de búsqueda
  const filteredEmpresas = empresas.filter(empresa =>
    empresa.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    empresa.ruc.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejador de cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEmpresa(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Limpiar error de validación al editar
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // Abrir modal para nueva empresa
  const handleAddNew = () => {
    setCurrentEmpresa({
      nombre: "",
      ruc: "",
      contacto: "",
      email: "",
      telefono: "",
      direccion: ""
    });
    setValidationErrors({});
    setIsEditing(false);
    setShowModal(true);
  };

  // Abrir modal para editar empresa
  const handleEdit = (empresa) => {
    setCurrentEmpresa(empresa);
    setValidationErrors({});
    setIsEditing(true);
    setShowModal(true);
  };

  // Eliminar empresa
  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro que deseas eliminar esta empresa?')) {
      return;
    }

    try {
      await axios.delete(`/api/empresas/${id}`);
      setEmpresas(prevState => prevState.filter(empresa => empresa.empresa_id !== id));
    } catch (err) {
      console.error("Error al eliminar empresa:", err);
      alert("Error al eliminar la empresa. Por favor, inténtalo de nuevo.");
    }
  };

  // Validar formulario
  const validateForm = () => {
    const errors = {};
    
    if (!currentEmpresa.nombre.trim()) {
      errors.nombre = "El nombre de la empresa es requerido";
    }
    
    if (!currentEmpresa.ruc.trim()) {
      errors.ruc = "El RUC es requerido";
    } else if (!/^\d{10,13}$/.test(currentEmpresa.ruc.trim())) {
      errors.ruc = "El RUC debe tener entre 10 y 13 dígitos";
    }
    
    if (currentEmpresa.email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(currentEmpresa.email)) {
      errors.email = "Formato de email inválido";
    }

    return errors;
  };

  // Guardar empresa (crear o actualizar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    try {
      let response;
      
      if (isEditing) {
        response = await axios.put(
          `/api/empresas/${currentEmpresa.empresa_id}`,
          currentEmpresa
        );
        
        setEmpresas(prevState =>
          prevState.map(empresa =>
            empresa.empresa_id === currentEmpresa.empresa_id ? response.data : empresa
          )
        );
      } else {
        response = await axios.post('/api/empresas', currentEmpresa);
        setEmpresas(prevState => [...prevState, response.data]);
      }
      
      setShowModal(false);
      setValidationErrors({});
    } catch (error) {
      console.error("Error al guardar empresa:", error);
      
      if (error.response && error.response.data && error.response.data.error) {
        alert(`Error: ${error.response.data.error}`);
      } else {
        alert("Error al guardar la empresa. Por favor, inténtalo de nuevo.");
      }
    }
  };

  // Datos para las migas de pan
  const breadcrumbs = [
    { label: 'Empresas con convenio' }
  ];

  return (
    <AdminLayout 
      title="Gestión de Empresas con Convenio" 
      breadcrumbs={breadcrumbs}
    >
      <div className={styles.container}>
        <div className={styles.pageHeader}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Buscar por nombre o RUC..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <span className={styles.searchIcon}>🔍</span>
          </div>
          
          <button 
            onClick={handleAddNew}
            className={styles.addButton}
          >
            Agregar empresa
          </button>
        </div>
        
        {loading ? (
          <div className={styles.loadingContainer}>Cargando empresas...</div>
        ) : error ? (
          <div className={styles.errorContainer}>{error}</div>
        ) : filteredEmpresas.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No se encontraron empresas con el término de búsqueda.</p>
            <button 
              onClick={handleAddNew}
              className={styles.addButtonSecondary}
            >
              Agregar nueva empresa
            </button>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>RUC</th>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmpresas.map(empresa => (
                  <tr key={empresa.empresa_id}>
                    <td>{empresa.nombre}</td>
                    <td>{empresa.ruc}</td>
                    <td>{empresa.contacto || '-'}</td>
                    <td>{empresa.email || '-'}</td>
                    <td>{empresa.telefono || '-'}</td>
                    <td className={styles.actionCell}>
                      <button
                        onClick={() => handleEdit(empresa)}
                        className={`${styles.actionButton} ${styles.editButton}`}
                        title="Editar"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDelete(empresa.empresa_id)}
                        className={`${styles.actionButton} ${styles.deleteButton}`}
                        title="Eliminar"
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
      </div>
      
      {/* Modal para agregar/editar empresa */}
      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{isEditing ? "Editar empresa" : "Agregar nueva empresa"}</h2>
              <button 
                onClick={() => setShowModal(false)}
                className={styles.closeButton}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="nombre">Nombre de la empresa *</label>
                <input
                  type="text"
                  id="nombre"
                  name="nombre"
                  value={currentEmpresa.nombre}
                  onChange={handleInputChange}
                  className={validationErrors.nombre ? styles.inputError : ''}
                />
                {validationErrors.nombre && (
                  <div className={styles.errorMessage}>{validationErrors.nombre}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="ruc">RUC *</label>
                <input
                  type="text"
                  id="ruc"
                  name="ruc"
                  value={currentEmpresa.ruc}
                  onChange={handleInputChange}
                  className={validationErrors.ruc ? styles.inputError : ''}
                />
                {validationErrors.ruc && (
                  <div className={styles.errorMessage}>{validationErrors.ruc}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="contacto">Persona de contacto</label>
                <input
                  type="text"
                  id="contacto"
                  name="contacto"
                  value={currentEmpresa.contacto || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={currentEmpresa.email || ''}
                  onChange={handleInputChange}
                  className={validationErrors.email ? styles.inputError : ''}
                />
                {validationErrors.email && (
                  <div className={styles.errorMessage}>{validationErrors.email}</div>
                )}
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="telefono">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  name="telefono"
                  value={currentEmpresa.telefono || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="direccion">Dirección</label>
                <textarea
                  id="direccion"
                  name="direccion"
                  rows="3"
                  value={currentEmpresa.direccion || ''}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={styles.cancelButton}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.submitButton}
                >
                  {isEditing ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default EmpresasPage;rrrrrrrrrrrrrrrrrrrrrrrrrr