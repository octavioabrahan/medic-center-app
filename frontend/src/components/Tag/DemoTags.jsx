import React, { useState } from 'react';
import Tag from './Tag';
import TagToggle from './TagToggle';
import './DemoTags.css';

const DemoTags = () => {
  // Estado para controlar la visibilidad de tags demo
  const [visibleTags, setVisibleTags] = useState({
    brand: true,
    brandSecondary: true,
    danger: true,
    dangerSecondary: true,
    positive: true,
    positiveSecondary: true,
    warning: true,
    neutral: true,
    neutralSecondary: true,
  });
  
  // Estado para los TagToggles
  const [activeToggle1, setActiveToggle1] = useState(true);
  const [activeToggle2, setActiveToggle2] = useState(false);
  const [activeToggles, setActiveToggles] = useState({
    active: true,
    inactive: false,
  });

  // Función para cerrar un tag específico
  const handleClose = (tagId) => {
    setVisibleTags(prev => ({
      ...prev,
      [tagId]: false
    }));
  };

  // Función para restablecer todos los tags
  const resetTags = () => {
    setVisibleTags({
      brand: true,
      brandSecondary: true,
      danger: true,
      dangerSecondary: true,
      positive: true,
      positiveSecondary: true,
      warning: true,
      neutral: true,
      neutralSecondary: true,
    });
  };
  
  // Función para manejar cambios en los TagToggles de grupo
  const handleActiveToggleChange = (name) => (active) => {
    setActiveToggles(prev => ({
      ...prev,
      [name]: active
    }));
  };

  return (
    <div className="demo-container">
      <h1>Demostración de Tags</h1>
      
      <button className="reset-button" onClick={resetTags}>
        Restablecer todos los tags
      </button>
      
      <section className="demo-section">
        <h2>Brand Tags</h2>
        <div className="tag-group">
          <h3>Primary</h3>
          <div className="tag-example">
            {visibleTags.brand ? (
              <Tag 
                text="Tag Brand Primary" 
                scheme="brand"
                variant="primary"
                onClose={() => handleClose('brand')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('brand')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="brand"
              variant="primary"
              hover={true}
            />
          </div>
        </div>
        
        <div className="tag-group">
          <h3>Secondary</h3>
          <div className="tag-example">
            {visibleTags.brandSecondary ? (
              <Tag 
                text="Tag Brand Secondary"
                scheme="brand"
                variant="secondary" 
                onClose={() => handleClose('brandSecondary')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('brandSecondary')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="brand"
              variant="secondary"
              hover={true}
            />
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Danger Tags</h2>
        <div className="tag-group">
          <h3>Primary</h3>
          <div className="tag-example">
            {visibleTags.danger ? (
              <Tag 
                text="Tag Danger Primary" 
                scheme="danger"
                variant="primary"
                onClose={() => handleClose('danger')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('danger')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="danger"
              variant="primary"
              hover={true}
            />
          </div>
        </div>
        
        <div className="tag-group">
          <h3>Secondary</h3>
          <div className="tag-example">
            {visibleTags.dangerSecondary ? (
              <Tag 
                text="Tag Danger Secondary"
                scheme="danger"
                variant="secondary" 
                onClose={() => handleClose('dangerSecondary')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('dangerSecondary')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="danger"
              variant="secondary"
              hover={true}
            />
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Positive Tags</h2>
        <div className="tag-group">
          <h3>Primary</h3>
          <div className="tag-example">
            {visibleTags.positive ? (
              <Tag 
                text="Tag Positive Primary" 
                scheme="positive"
                variant="primary"
                onClose={() => handleClose('positive')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('positive')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="positive"
              variant="primary"
              hover={true}
            />
          </div>
        </div>
        
        <div className="tag-group">
          <h3>Secondary</h3>
          <div className="tag-example">
            {visibleTags.positiveSecondary ? (
              <Tag 
                text="Tag Positive Secondary"
                scheme="positive"
                variant="secondary" 
                onClose={() => handleClose('positiveSecondary')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('positiveSecondary')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="positive"
              variant="secondary"
              hover={true}
            />
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Warning Tags</h2>
        <div className="tag-group">
          <h3>Default</h3>
          <div className="tag-example">
            {visibleTags.warning ? (
              <Tag 
                text="Tag Warning" 
                scheme="warning"
                onClose={() => handleClose('warning')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('warning')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="warning"
              hover={true}
            />
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Neutral Tags</h2>
        <div className="tag-group">
          <h3>Primary</h3>
          <div className="tag-example">
            {visibleTags.neutral ? (
              <Tag 
                text="Tag Neutral Primary" 
                scheme="neutral"
                variant="primary"
                onClose={() => handleClose('neutral')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('neutral')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="neutral"
              variant="primary"
              hover={true}
            />
          </div>
        </div>
        
        <div className="tag-group">
          <h3>Secondary</h3>
          <div className="tag-example">
            {visibleTags.neutralSecondary ? (
              <Tag 
                text="Tag Neutral Secondary"
                scheme="neutral"
                variant="secondary" 
                onClose={() => handleClose('neutralSecondary')}
              />
            ) : (
              <button className="reset-button" onClick={() => handleClose('neutralSecondary')}>
                Mostrar tag
              </button>
            )}
          </div>
          <div className="tag-example">
            <Tag 
              text="Hover State" 
              scheme="neutral"
              variant="secondary"
              hover={true}
            />
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Variaciones</h2>
        
        <div className="tag-group">
          <h3>Tag sin función de cierre</h3>
          <div className="tag-example">
            <Tag 
              text="Sin función de cierre"
              scheme="brand"
              variant="primary"
            />
          </div>
        </div>

        <div className="tag-group">
          <h3>Tag con función de cierre pero sin botón X</h3>
          <div className="tag-example">
            <Tag 
              text="Closeable = false"
              scheme="brand"
              variant="primary"
              onClose={() => alert('Esta función no se llamará porque closeable=false')}
              closeable={false}
            />
          </div>
        </div>
        
        <div className="tag-group">
          <h3>Múltiples Tags</h3>
          <div className="tag-example tags-container">
            <Tag text="Medicina" scheme="brand" onClose={() => {}} />
            <Tag text="Urgente" scheme="danger" onClose={() => {}} />
            <Tag text="Confirmado" scheme="positive" onClose={() => {}} />
            <Tag text="Pendiente" scheme="warning" onClose={() => {}} />
            <Tag text="Neutral" scheme="neutral" onClose={() => {}} />
          </div>
        </div>
        
        <div className="tag-group">
          <h3>Múltiples Tags no cerrables</h3>
          <div className="tag-example tags-container">
            <Tag text="Medicina" scheme="brand" closeable={false} />
            <Tag text="Urgente" scheme="danger" closeable={false} />
            <Tag text="Confirmado" scheme="positive" closeable={false} />
            <Tag text="Pendiente" scheme="warning" closeable={false} />
            <Tag text="Neutral" scheme="neutral" closeable={false} />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>Tag Toggle</h2>
        <p>Componente para selección de estado activo/inactivo</p>
        
        <div className="tag-group">
          <h3>Estados básicos</h3>
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
          <h3>Estado inactivo</h3>
          <div className="tag-example">
            <TagToggle 
              label="Inactive" 
              active={activeToggle2}
              onChange={setActiveToggle2}
            />
          </div>
          <p>Estado actual: {activeToggle2 ? 'Activo' : 'Inactivo'}</p>
        </div>
        
        <div className="tag-group">
          <h3>Grupos de toggles</h3>
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
        </div>
        
        <div className="tag-group">
          <h3>Estados estáticos (para referencia)</h3>
          <div className="tag-example">
            <TagToggle label="Siempre activo" active={true} />
          </div>
          <div className="tag-example" style={{ marginTop: '8px' }}>
            <TagToggle label="Siempre inactivo" active={false} />
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoTags;
