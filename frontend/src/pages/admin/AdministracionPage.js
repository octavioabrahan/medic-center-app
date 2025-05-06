import React, { useState } from "react";
import "./AdministracionPage.css";
import UsuariosAdminTab from "../../components/admin/UsuariosAdminTab";
import RolesAdminTab from "../../components/admin/RolesAdminTab";
import PantallasAdminTab from "../../components/admin/PantallasAdminTab";
import { auth } from "../../api";

function AdministracionPage() {
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
    <div className="admin-container">
      <h1>Administración del Sistema</h1>
      
      <div className="tabs-container">
        <div className="tabs-header">
          <button 
            className={`tab-button ${activeTab === "usuarios" ? "active" : ""}`} 
            onClick={() => setActiveTab("usuarios")}
          >
            Usuarios
          </button>
          <button 
            className={`tab-button ${activeTab === "roles" ? "active" : ""}`} 
            onClick={() => setActiveTab("roles")}
          >
            Roles
          </button>
          {/* Solo mostrar la pestaña de Pantallas para superadmin */}
          {isSuperAdmin && (
            <button 
              className={`tab-button ${activeTab === "pantallas" ? "active" : ""}`} 
              onClick={() => setActiveTab("pantallas")}
            >
              Pantallas
            </button>
          )}
        </div>
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AdministracionPage;