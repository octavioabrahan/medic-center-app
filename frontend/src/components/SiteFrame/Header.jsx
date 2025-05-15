// src/components/SiteFrame/Header.jsx
import React from 'react';
import './SiteFrame.css';
import logo from '../../assets/logo_header.png'; // Asegúrate de tener esta imagen en assets

/**
 * Header component for the SiteFrame
 */
const Header = () => {
  return (
    <header className="site-frame__header">
      <div className="site-frame__top-bar">
        <img className="site-frame__logo" src={logo} alt="Logo" />
      </div>
    </header>
  );
};

export default Header;
