import React from 'react';
import Menu from './Menu';
import { SiteFrame } from '../SiteFrame';
import './DemoMenus.css';

const DemoMenus = () => {
  // Función de ejemplo para manejar clics
  const handleMenuClick = (label) => {
    alert(`Menú "${label}" clickeado`);
  };
  
  // Iconos para usar en los ejemplos
  const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="heroicons-mini-home">
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clipRule="evenodd" />
    </svg>
  );
  
  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="heroicons-mini-calendar">
      <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
    </svg>
  );
  
  const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="heroicons-mini-user">
      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
    </svg>
  );

  return (
    <SiteFrame>
      <div className="demo-menus-container">
        <h1>Demostración de Menú</h1>
      
        <section className="demo-section">
          <h2>Estados de Menú</h2>
          
          <div className="demo-states">
            <div className="demo-state">
              <h3>Default</h3>
              <Menu 
                icon={<HomeIcon />}
                label="Menu Label"
                description="Menu description."
                onClick={() => handleMenuClick("Default")}
              />
            </div>
            
            <div className="demo-state">
              <h3>Hover (simulated)</h3>
              <div className="menu-item-hover-demo">
                <Menu 
                  icon={<HomeIcon />}
                  label="Menu Label"
                  description="Menu description."
                  onClick={() => handleMenuClick("Hover")}
                />
              </div>
            </div>
            
            <div className="demo-state">
              <h3>Disabled</h3>
              <Menu 
                icon={<HomeIcon />}
                label="Menu Label"
                description="Menu description."
                disabled={true}
              />
            </div>
          </div>
        </section>
        
        <section className="demo-section">
          <h2>Ejemplos</h2>
          
          <div className="demo-menu-examples">
            <Menu 
              icon={<HomeIcon />}
              label="Dashboard"
              description="Ver el panel principal"
              onClick={() => handleMenuClick("Dashboard")}
            />
            
            <Menu 
              icon={<CalendarIcon />}
              label="Agendar Cita"
              description="Reservar un horario de atención"
              onClick={() => handleMenuClick("Agendar Cita")}
            />
            
            <Menu 
              icon={<UserIcon />}
              label="Mi Perfil"
              description="Ver y editar información personal"
              onClick={() => handleMenuClick("Mi Perfil")}
            />
          </div>
        </section>
      </div>
    </SiteFrame>
  );
};

export default DemoMenus;
