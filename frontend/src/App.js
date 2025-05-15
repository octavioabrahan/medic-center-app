import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

// Lazy load para páginas de administración
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCitas = lazy(() => import('./pages/admin/AdminCitas'));
const AdminConvenios = lazy(() => import('./pages/admin/AdminConvenios'));
const EspecialidadesPage = lazy(() => import('./pages/admin/EspecialidadesPage'));
const HorariosPage = lazy(() => import('./pages/admin/HorariosPage'));
const ServiciosPage = lazy(() => import('./pages/admin/ServiciosPage'));
const AdminExamenes = lazy(() => import('./pages/admin/AdminExamenes'));

// Lazy load para los demos
const ButtonDemo = lazy(() => import('./components/Button/ButtonDemo'));
const InputDemo = lazy(() => import('./components/Inputs/InputDemo'));
const DemoBanners = lazy(() => import('./components/Banner/DemoBanners'));
const DemoTags = lazy(() => import('./components/Tag/DemoTags'));
const DemoModals = lazy(() => import('./components/Modal/DemoModals'));
const DemoTabs = lazy(() => import('./components/Tab/DemoTabs'));
const DemoText = lazy(() => import('./components/Text/DemoText'));
const DemoSiteFrame = lazy(() => import('./components/SiteFrame/DemoSiteFrame'));
const DemoIndex = lazy(() => import('./components/Demo/DemoIndex'));

function App() {
  return (
    <Router>
      <Routes>
        {/* Ruta principal para el índice de demos */}
        <Route path="/demo" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoIndex />
          </Suspense>
        } />
        
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

        {/* Rutas de administración */}
        <Route path="/admin/dashboard" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path="/admin/citas" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminCitas />
          </Suspense>
        } />
        <Route path="/admin/horarios" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <HorariosPage />
          </Suspense>
        } />
        <Route path="/admin/especialidades" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <EspecialidadesPage />
          </Suspense>
        } />
        <Route path="/admin/servicios" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <ServiciosPage />
          </Suspense>
        } />
        <Route path="/admin/convenios" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminConvenios />
          </Suspense>
        } />
        <Route path="/admin/examenes" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminExamenes />
          </Suspense>
        } />
        
        {/* Ruta para redirigir 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;