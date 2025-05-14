import React, { useState } from 'react';
import TagToggle from './TagToggle';
import './DemoTags.css'; // Reutilizamos los estilos de demostración existentes

const DemoTagToggle = () => {
  const [activeToggle1, setActiveToggle1] = useState(true);
  const [activeToggle2, setActiveToggle2] = useState(false);
  const [activeToggles, setActiveToggles] = useState({
    active: true,
    inactive: false,
  });

  const handleActiveToggleChange = (name) => (active) => {
    setActiveToggles(prev => ({
      ...prev,
      [name]: active
    }));
  };

  return (
    <div className="demo-container">
      <h1>Demostración de Tag Toggle</h1>
      
      <section className="demo-section">
        <h2>Estados básicos</h2>
        
        <div className="tag-group">
          <h3>Estado activo (Active)</h3>
          <div className="tag-example">
            <TagToggle 
              label="Active" 
              active={activeToggle1}
              onChange={setActiveToggle1}
            />
          </div>
          <p>Estado actual: {activeToggle1 ? 'Activo' : 'Inactivo'}</p>
        </div>
        
        <div className="tag-group">
          <h3>Estado inactivo (Inactive)</h3>
          <div className="tag-example">
            <TagToggle 
              label="Inactive" 
              active={activeToggle2}
              onChange={setActiveToggle2}
            />
          </div>
          <p>Estado actual: {activeToggle2 ? 'Activo' : 'Inactivo'}</p>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Grupos de toggles</h2>
        <div className="tag-example tags-container">
          <TagToggle 
            label="Active" 
            active={activeToggles.active}
            onChange={handleActiveToggleChange('active')}
          />
          <TagToggle 
            label="Inactive" 
            active={activeToggles.inactive}
            onChange={handleActiveToggleChange('inactive')}
          />
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Estados estáticos (para referencia)</h2>
        <div className="tag-group">
          <h3>Siempre activo</h3>
          <div className="tag-example">
            <TagToggle label="Siempre activo" active={true} />
          </div>
        </div>
        <div className="tag-group">
          <h3>Siempre inactivo</h3>
          <div className="tag-example">
            <TagToggle label="Siempre inactivo" active={false} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoTagToggle;
