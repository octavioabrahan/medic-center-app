// src/components/Demo/DemoIndex.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { TextLinkList } from '../Text/Text';
import { SiteFrame } from '../SiteFrame';
import '../../styles/tokens.css';

/**
 * Componente que muestra una lista de todos los demos disponibles en la aplicación
 */
const DemoIndex = () => {
  // Lista de demos disponibles
  const demoLinks = [
    <Link to="/demo/button">Botones</Link>,
    <Link to="/demo/inputs">Inputs</Link>,
    <Link to="/demo/banners">Banners</Link>,
    <Link to="/demo/tags">Tags</Link>,
    <Link to="/demo/modals">Modals</Link>,
    <Link to="/demo/tabs">Tabs</Link>,
    <Link to="/demo/texts">Textos</Link>,
    <Link to="/demo/siteframe">Site Frame</Link>,
    <Link to="/demo/menus">Menús</Link>,
  ];

  return (
    <SiteFrame>
      <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem' }}>Catálogo de Componentes</h1>
        
        <p style={{ marginBottom: '2rem' }}>
          Selecciona un componente para ver sus ejemplos y variantes.
        </p>
        
        <TextLinkList 
          title="Componentes disponibles" 
          items={demoLinks} 
        />
      </div>
    </SiteFrame>
  );
};

export default DemoIndex;
