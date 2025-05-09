import React, { useEffect, useState } from "react";
import "./AdminAdministracion.css";
import "./components/AdminCommon.css"; // Actualizada ubicación de estilos comunes
import UsuariosAdminTab from "./components/UsuariosAdminTab";
import RolesAdminTab from "./components/RolesAdminTab";
import PantallasAdminTab from "./components/PantallasAdminTab";
import { auth } from "../../api";

function AdminAdministracion() {
  const [activeTab, setActiveTab] = useState("usuarios");
  const currentUser = auth.getCurrentUser();
  const isSuperAdmin = currentUser?.roles?.includes('superadmin');

  const renderTabContent = () => {
    switch (activeTab) {
      case "usuarios":
        return <UsuariosAdminTab />;
      case "roles":
        return <RolesAdminTab />;
      case "pantallas":
        return isSuperAdmin ? <PantallasAdminTab /> : <div className="access-denied">Acceso denegado</div>;
      default:
        return <div>Seleccione una pestaña</div>;
    }
  };

  return (
    <div className="admin-page-container">
      <h1 className="admin-page-title">Administración del Sistema</h1>
      
      <div className="admin-tabs">
        <div className="admin-tabs-header">
          <button 
            className={`admin-tab ${activeTab === "usuarios" ? "active" : ""}`} 
            onClick={() => setActiveTab("usuarios")}
          >
            Usuarios
          </button>
          <button 
            className={`admin-tab ${activeTab === "roles" ? "active" : ""}`} 
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </button>
          {/* Solo mostrar la pestaña de Pantallas para superadmin */}
          {isSuperAdmin && (
            <button 
              className={`admin-tab ${activeTab === "pantallas" ? "active" : ""}`} 
              onClick={() => setActiveTab("pantallas")}
            >
              Pantallas
            </button>
          )}
        </div>
      </div>
      
      <div className="admin-tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AdminAdministracion;