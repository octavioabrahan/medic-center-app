import React from 'react';
import Text from './Text';
import './DemoText.css';

const DemoText = () => {
  return (
    <div className="demo-text-container">
      <h1 className="demo-title">Demostración de Texto</h1>
      
      <section className="demo-section">
        <h2>Tipografía de texto</h2>
        
        <div className="text-example-grid">
          {/* Typography Hierarchy - de mayor a menor */}
          <div className="text-example">
            <h3>Title Hero</h3>
            <Text variant="titleHero">Text Title Hero</Text>
          </div>
          
          <div className="text-example">
            <h3>Title Page</h3>
            <Text variant="titlePage">Text Title Page</Text>
          </div>
          
          <div className="text-example">
            <h3>Subtitle</h3>
            <Text variant="subtitle">Text Subtitle</Text>
          </div>
          
          <div className="text-example">
            <h3>Heading</h3>
            <Text variant="heading">Text Heading</Text>
          </div>
          
          <div className="text-example">
            <h3>Subheading</h3>
            <Text variant="subheading">Text Subheading</Text>
          </div>
          
          <div className="text-example">
            <h3>Text Base (Default)</h3>
            <Text>Text</Text>
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Variaciones de texto base</h2>
        
        <div className="text-example-grid">
          <div className="text-example">
            <h3>Emphasis</h3>
            <Text variant="emphasis">Text Emphasis</Text>
          </div>
          
          <div className="text-example">
            <h3>Strong</h3>
            <Text variant="strong">Text Strong</Text>
          </div>
          
          <div className="text-example">
            <h3>Link</h3>
            <Text variant="link">Text Link</Text>
          </div>
          
          <div className="text-example">
            <h3>Code</h3>
            <Text variant="code">Text Code</Text>
          </div>
          
          <div className="text-example">
            <h3>Small</h3>
            <Text variant="small">Text Small</Text>
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Elementos de lista</h2>
        
        <div className="text-example-grid">
          <div className="text-example">
            <h3>List Item</h3>
            <Text isListItem={true}>List item</Text>
          </div>
          
          <div className="text-example">
            <h3>Link List Item</h3>
            <Text isLinkListItem={true}>List item</Text>
          </div>
        </div>
      </section>
      
      <section className="demo-section">
        <h2>Ejemplos de uso</h2>
        
        <div className="usage-example">
          <Text variant="titleHero">Clínica de Especialidades</Text>
          <Text variant="subtitle">Centro médico especializado</Text>
          
          <div className="content-block">
            <Text variant="heading">Servicios médicos</Text>
            <Text>Ofrecemos atención médica de calidad con un equipo de profesionales altamente calificados.</Text>
            
            <div className="list-container">
              <Text isListItem={true}>Consultas especializadas</Text>
              <Text isListItem={true}>Exámenes diagnósticos</Text>
              <Text isListItem={true}>Atención personalizada</Text>
            </div>
            
            <div className="highlight-block">
              <Text variant="strong">Horario de atención:</Text>
              <Text variant="code">Lunes a Viernes: 8:00 - 19:00</Text>
              <Text variant="code">Sábados: 9:00 - 13:00</Text>
            </div>
            
            <div className="note-block">
              <Text variant="emphasis">Atención preferencial a adultos mayores y personas con discapacidad.</Text>
              <Text variant="small">*Se requiere cita previa para ciertos servicios.</Text>
            </div>
          </div>
          
          <div className="footer-block">
            <Text variant="link">Agendar una cita</Text>
            <Text variant="link">Ver especialidades</Text>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DemoText;
