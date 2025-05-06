import React, { useState } from "react";
import "./AdministracionPage.css";
import UsuariosAdminTab from "../../components/admin/UsuariosAdminTab";
import RolesAdminTab from "../../components/admin/RolesAdminTab";

function AdministracionPage() {
  const [activeTab, setActiveTab] = useState("usuarios");

  const renderTabContent = () => {
    switch (activeTab) {
      case "usuarios":
        return <UsuariosAdminTab />;
      case "roles":
        return <RolesAdminTab />;
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
        </div>
      </div>
      
      <div className="tab-content">
        {renderTabContent()}
      </div>
    </div>
  );
}

export default AdministracionPage;