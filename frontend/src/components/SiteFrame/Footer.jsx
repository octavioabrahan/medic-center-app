// src/components/SiteFrame/Footer.jsx
import React from 'react';
import './SiteFrame.css';
import logoOficial from '../../assets/logo_savio.svg'; // Asegúrate de tener esta imagen en assets

/**
 * Footer component for the SiteFrame
 */
const Footer = () => {
  return (
    <footer className="site-frame__footer">
      <div className="site-frame__footer-content">
        <div className="site-frame__powered-by">Powered by</div>
        <img className="site-frame__logo-oficial" src={logoOficial} alt="Logo Savio Tech" />
      </div>
    </footer>
  );
};

export default Footer;
