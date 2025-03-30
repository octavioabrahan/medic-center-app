import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import AgendarHora from './pages/AgendarHora';
import CotizadorExamenes from './pages/CotizadorExamenes'; // 👈 este es nuevo

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">Inicio</Link> | <Link to="/cotizar">Cotizar Examen</Link> | <Link to="/agendar">Agendar Hora</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cotizar" element={<CotizadorExamenes />} /> {/* 👈 este reemplaza el anterior */}
        <Route path="/agendar" element={<AgendarHora />} />
      </Routes>
    </Router>
  );
}

export default App;

