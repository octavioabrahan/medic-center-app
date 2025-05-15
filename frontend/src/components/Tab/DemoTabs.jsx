import React from 'react';
import Tab from './Tab';
import TabGroup from './TabGroup';
import './DemoTabs.css';

const DemoTabs = () => {
  // Ejemplo de contenido para las pestañas
  const tabsWithContent = [
    {
      label: 'Información General',
      content: (
        <div className="tab-content-example">
          <h3>Información General</h3>
          <p>Esta sección contiene información general sobre el paciente.</p>
        </div>
      ),
    },
    {
      label: 'Historial Médico',
      content: (
        <div className="tab-content-example">
          <h3>Historial Médico</h3>
          <p>Aquí se muestra el historial médico completo del paciente.</p>
        </div>
      ),
    },
    {
      label: 'Citas',
      content: (
        <div className="tab-content-example">
          <h3>Citas Programadas</h3>
          <p>Lista de citas pasadas y futuras del paciente.</p>
        </div>
      ),
    },
    {
      label: 'Tab Inactivo',
      content: (
        <div className="tab-content-example">
          <h3>Contenido Inactivo</h3>
          <p>Este contenido no debería verse porque la pestaña está inactiva.</p>
        </div>
      ),
      disabled: true,
    },
  ];

  return (
    <div className="demo-tabs-container">
      <h1>Demostración de Tabs</h1>
      
      <section className="demo-section">
        <h2>Estados de Pestaña Individual</h2>
        
        <div className="tab-examples">
          <div className="tab-example">
            <h3>Pestaña Default</h3>
            <Tab label="Label" />
          </div>
          
          <div className="tab-example">
            <h3>Pestaña Hover</h3>
            <Tab label="Label" className="state-hover" />
          </div>
          
          <div className="tab-example">
            <h3>Pestaña Activa</h3>
            <Tab label="Label" active={true} />
          </div>
          
          <div className="tab-example">
            <h3>Pestaña Inactiva</h3>
            <Tab label="Label" disabled={true} />
          </div>
        </div>
      </section>

      <section className="demo-section">
        <h2>Grupo de Pestañas</h2>
        <TabGroup tabs={tabsWithContent} defaultActiveTab={0} />
      </section>
    </div>
  );
};

export default DemoTabs;
