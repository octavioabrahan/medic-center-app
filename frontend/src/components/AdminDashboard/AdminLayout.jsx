// src/components/AdminDashboard/AdminLayout.jsx
import React from 'react';
import { SiteFrame } from '../SiteFrame';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

/**
 * AdminLayout component that provides a layout for admin pages,
 * including the sidebar menu and the main content area.
 * 
 * Props:
 *   - children: JSX content to display in the main area
 *   - username: The name of the current logged in user
 *   - role: The role of the current logged in user
 *   - activePage: The current active page
 */
const AdminLayout = ({ 
  children, 
  username = 'Usuario', 
  role = 'Administrador', 
  activePage = '' 
}) => {
  return (
    <SiteFrame>
      <div className="admin-layout">
        <AdminSidebar 
          username={username} 
          role={role} 
          activePage={activePage} 
        />
        <div className="admin-layout__content">
          {children}
        </div>
      </div>
    </SiteFrame>
  );
};

export default AdminLayout;
