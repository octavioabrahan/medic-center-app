import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

// Lazy load para los demos
const ButtonDemo = lazy(() => import('./components/Button/ButtonDemo'));
const InputDemo = lazy(() => import('./components/Inputs/InputDemo'));
const DemoBanners = lazy(() => import('./components/Banner/DemoBanners'));
const DemoTags = lazy(() => import('./components/Tag/DemoTags'));
const DemoModals = lazy(() => import('./components/Modal/DemoModals'));
const DemoTabs = lazy(() => import('./components/Tab/DemoTabs'));
const DemoText = lazy(() => import('./components/Text/DemoText'));
const DemoSiteFrame = lazy(() => import('./components/SiteFrame/DemoSiteFrame'));

function App() {
  return (
    <Router>
      <Routes>
        {/* Demo routes primero para evitar cargar el resto de la app innecesariamente */}
        <Route path="/demo/button" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <ButtonDemo />
          </Suspense>
        } />
        <Route path="/demo/inputs" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <InputDemo />
          </Suspense>
        } />
        <Route path="/demo/banners" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoBanners />
          </Suspense>
        } />
        <Route path="/demo/tags" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoTags />
          </Suspense>
        } />
        <Route path="/demo/modals" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoModals />
          </Suspense>
        } />
        <Route path="/demo/tabs" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoTabs />
          </Suspense>
        } />
        <Route path="/demo/texts" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoText />
          </Suspense>
        } />
        <Route path="/demo/siteframe" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoSiteFrame />
          </Suspense>
        } />
        {/* Rutas públicas mínimas */}
        <Route path="/" element={<Home />} />
        {/* Ruta para redirigir 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;