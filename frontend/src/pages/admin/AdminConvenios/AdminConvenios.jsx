import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../components/AdminDashboard/AdminLayout';
import Button from '../../../components/Button/Button';
import SearchField from '../../../components/Inputs/SearchField';
import CheckboxField from '../../../components/Inputs/CheckboxField';
import TagToggleGroup from '../../../components/Tag/TagToggleGroup';
import TagToggle from '../../../components/Tag/TagToggle';
import Table from '../../../components/Tables/Table';
import Tag from '../../../components/Tag/Tag';
import AgregarEmpresaConvenio from './AgregarEmpresaConvenio';
import EditarEmpresaConvenio from './EditarEmpresaConvenio';
import styles from './AdminConvenios.module.css';
import axios from 'axios';

const BuildingOfficeIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M0.8 2.2C0.8 1.868 1.069 1.6 1.4 1.6H9.8C10.131 1.6 10.4 1.869 10.4 2.2C10.4 2.531 10.131 2.8 9.8 2.8H9.6V13.8C9.6 14.132 9.331 14.4 9 14.4H7.8C7.469 14.4 7.2 14.132 7.2 13.8V11.8C7.2 11.469 6.931 11.2 6.6 11.2H4.6C4.269 11.2 4 11.469 4 11.8V13.8C4 14.132 3.731 14.4 3.4 14.4H1.4C1.069 14.4 0.8 14.132 0.8 13.8C0.8 13.469 1.069 13.2 1.4 13.2H1.6V2.8H1.4C1.069 2.8 0.8 2.531 0.8 2.2ZM3.2 4.4C3.2 4.179 3.379 4 3.6 4H4.4C4.621 4 4.8 4.179 4.8 4.4V5.2C4.8 5.421 4.621 5.6 4.4 5.6H3.6C3.379 5.6 3.2 5.421 3.2 5.2V4.4ZM3.6 7.2C3.379 7.2 3.2 7.379 3.2 7.6V8.4C3.2 8.621 3.379 8.8 3.6 8.8H4.4C4.621 8.8 4.8 8.621 4.8 8.4V7.6C4.8 7.379 4.621 7.2 4.4 7.2H3.6ZM6.4 4.4C6.4 4.179 6.579 4 6.8 4H7.6C7.821 4 8 4.179 8 4.4V5.2C8 5.421 7.821 5.6 7.6 5.6H6.8C6.579 5.6 6.4 5.421 6.4 5.2V4.4ZM6.8 7.2C6.579 7.2 6.4 7.379 6.4 7.6V8.4C6.4 8.621 6.579 8.8 6.8 8.8H7.6C7.821 8.8 8 8.621 8 8.4V7.6C8 7.379 7.821 7.2 7.6 7.2H6.8Z" fill="var(--Icon-Brand-On-Brand, #F0F3FF)"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M11.4 4.8C11.069 4.8 10.8 5.069 10.8 5.4V13.6C10.8 14.042 11.158 14.4 11.6 14.4H14.6C14.931 14.4 15.2 14.132 15.2 13.8C15.2 13.469 14.931 13.2 14.6 13.2H14.4V6H14.6C14.931 6 15.2 5.731 15.2 5.4C15.2 5.069 14.931 4.8 14.6 4.8H11.4ZM11.8 7.6C11.8 7.379 11.979 7.2 12.2 7.2H13C13.221 7.2 13.4 7.379 13.4 7.6V8.4C13.4 8.621 13.221 8.8 13 8.8H12.2C11.979 8.8 11.8 8.621 11.8 8.4V7.6ZM12.2 10.4C11.979 10.4 11.8 10.579 11.8 10.8V11.6C11.8 11.821 11.979 12 12.2 12H13C13.221 12 13.4 11.821 13.4 11.6V10.8C13.4 10.579 13.221 10.4 13 10.4H12.2Z" fill="var(--Icon-Brand-On-Brand, #F0F3FF)"/>
  </svg>
);

const API_URL = `${process.env.REACT_APP_API_URL || ''}/api/empresas`;

const AdminConvenios = () => {
  const [empresas, setEmpresas] = useState([]);
  const [filteredEmpresas, setFilteredEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [sortAZ, setSortAZ] = useState(true);
  const [showAgregarEmpresaModal, setShowAgregarEmpresaModal] = useState(false);
  const [showEditarEmpresaModal, setShowEditarEmpresaModal] = useState(false);
  const [currentEmpresa, setCurrentEmpresa] = useState(null);

  useEffect(() => {
    cargarEmpresas();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [empresas, searchTerm, showArchived, sortAZ]);

  const cargarEmpresas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setEmpresas(res.data);
    } catch (err) {
      setError('No se pudieron cargar los convenios.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let results = [...empresas];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      results = results.filter(e =>
        e.nombre_empresa.toLowerCase().includes(term) ||
        e.rif.toLowerCase().includes(term)
      );
    }
    if (!showArchived) {
      results = results.filter(e => e.is_active);
    }
    results = results.sort((a, b) => sortAZ
      ? a.nombre_empresa.localeCompare(b.nombre_empresa)
      : b.nombre_empresa.localeCompare(a.nombre_empresa)
    );
    setFilteredEmpresas(results);
  };

  const handleAddEmpresa = async ({ nombre, rif }) => {
    try {
      await axios.post(API_URL, { nombre_empresa: nombre, rif });
      setShowAgregarEmpresaModal(false);
      cargarEmpresas();
    } catch (err) {
      setError('Error al agregar la empresa.');
    }
  };

  const handleEditEmpresa = async ({ nombre, rif }) => {
    if (!currentEmpresa) return;
    try {
      await axios.put(API_URL, {
        id_empresa: currentEmpresa.id_empresa,
        nombre_empresa: nombre,
        rif
      });
      setShowEditarEmpresaModal(false);
      setCurrentEmpresa(null);
      cargarEmpresas();
    } catch (err) {
      setError('Error al editar la empresa.');
    }
  };

  const handleArchiveEmpresa = async () => {
    if (!currentEmpresa) return;
    try {
      await axios.delete(`${API_URL}/${currentEmpresa.id_empresa}`);
      setShowEditarEmpresaModal(false);
      setCurrentEmpresa(null);
      cargarEmpresas();
    } catch (err) {
      setError('Error al archivar la empresa.');
    }
  };

  const handleActivateEmpresa = async (id_empresa) => {
    try {
      await axios.patch(`${API_URL}/${id_empresa}/activar`);
      cargarEmpresas();
    } catch (err) {
      setError('Error al activar la empresa.');
    }
  };

  return (
    <AdminLayout activePage="/admin/convenios">
      <div className={styles.adminConveniosContent}>
        <div className={styles.adminConveniosPageHeader}>
          <div className={styles.adminConveniosMenuHeader}>
            <div className={styles.adminConveniosTitle}>Convenios</div>
          </div>
          <Button variant="primary" onClick={() => setShowAgregarEmpresaModal(true)}>
            <BuildingOfficeIcon />
            <span>Agregar empresas con convenio</span>
          </Button>
        </div>
        <div className={styles.adminConveniosFilterBar}>
          <div className={styles.adminConveniosSearchFilter}>
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              onClear={() => setSearchTerm('')}
              placeholder="Buscar por nombre"
              className={styles.adminConveniosSearchFilter}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div className={styles.adminConveniosCheckboxField}>
              <CheckboxField
                label="Mostrar archivados"
                checked={showArchived}
                onChange={setShowArchived}
              />
            </div>
            <TagToggleGroup className={styles.adminConveniosTagToggleGroup}>
              <TagToggle
                label="A → Z"
                active={sortAZ}
                onChange={() => setSortAZ(true)}
                scheme="brand"
              />
              <TagToggle
                label="Z → A"
                active={!sortAZ}
                onChange={() => setSortAZ(false)}
                scheme="brand"
              />
            </TagToggleGroup>
          </div>
        </div>
        <div className={styles.adminConveniosBody}>
          {loading ? (
            <div className={styles.adminConveniosEmptyText}>Cargando convenios...</div>
          ) : error ? (
            <div className={styles.adminConveniosEmptyText}>{error}</div>
          ) : filteredEmpresas.length === 0 ? (
            <div className={styles.adminConveniosEmptyText}>
              Aún no has agregado ningun empresa con convenio
            </div>
          ) : (
            <Table
              headers={["Nombre", "RIF", "Estado", "Acciones"]}
              data={filteredEmpresas.map(e => ({
                ...e,
                estado: e.is_active ? (
                  <Tag text="Activo" scheme="positive" variant="secondary" closeable={false} />
                ) : (
                  <Tag text="Archivado" scheme="neutral" variant="secondary" closeable={false} />
                ),
                acciones: e.is_active ? (
                  <Button size="small" variant="subtle" onClick={() => { setCurrentEmpresa(e); setShowEditarEmpresaModal(true); }}>
                    Editar
                  </Button>
                ) : (
                  <Button size="small" variant="primary" onClick={() => handleActivateEmpresa(e.id_empresa)}>
                    Activar
                  </Button>
                )
              }))}
              columns={["nombre_empresa", "rif", "estado", "acciones"]}
            />
          )}
        </div>
      </div>
      <AgregarEmpresaConvenio
        isOpen={showAgregarEmpresaModal}
        onClose={() => setShowAgregarEmpresaModal(false)}
        onAdd={handleAddEmpresa}
      />
      <EditarEmpresaConvenio
        isOpen={showEditarEmpresaModal}
        onClose={() => { setShowEditarEmpresaModal(false); setCurrentEmpresa(null); }}
        onSave={handleEditEmpresa}
        onArchive={handleArchiveEmpresa}
        empresa={currentEmpresa ? { nombre: currentEmpresa.nombre_empresa, rif: currentEmpresa.rif } : null}
      />
    </AdminLayout>
  );
};

export default AdminConvenios;
