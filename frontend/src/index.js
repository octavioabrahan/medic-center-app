import React from 'react';
import ReactDOM from 'react-dom/client';

// Importa las variables generadas por Style Dictionary
import './styles/tokens.css';

// 2. Importa el CSS del demo de botones
import './components/Button/ButtonDemo.css';

// Si prefieres seguir usando tu App principal y añadir el demo dentro,
// importa App en lugar de ButtonDemo:
import App from './App';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
