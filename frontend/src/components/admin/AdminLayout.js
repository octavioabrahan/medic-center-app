// frontend/src/components/admin/AdminLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
// Eliminadas las importaciones CSS redundantes que ahora están en main.css
// import './AdminLayout.css';
// import './AdminCommon.css'; 

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;