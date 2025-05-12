import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. Importa los tokens globales (design-tokens.css)
import './styles/design-tokens.css';

// 2. Importa el CSS del demo de botones
import './components/ButtonDemo/ButtonDemo.css';

// 3. Importa ButtonDemo
import ButtonDemo from './components/ButtonDemo/ButtonDemo';

// Si prefieres seguir usando tu App principal y añadir el demo dentro,
// importa App en lugar de ButtonDemo:
// import App from './App';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* Renderiza directamente el demo de botones */}
    <ButtonDemo />

    {/* O, para integrarlo junto a tu App:
    <App>
      <ButtonDemo />
    </App>
    */}
  </React.StrictMode>
);

reportWebVitals();
