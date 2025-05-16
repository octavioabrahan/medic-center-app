import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';

// Lazy load para páginas de administración
const AdminDummy = lazy(() => import('./pages/admin/AdminDummy'));
const AdminCitasAgendadas = lazy(() => import('./pages/admin/AdminCitasAgendadas'));
const AdminHorarios = lazy(() => import('./pages/admin/AdminHorarios/AdminHorarios'));

// Lazy load para los demos
const ButtonDemo = lazy(() => import('./components/Button/ButtonDemo'));
const InputDemo = lazy(() => import('./components/Inputs/InputDemo'));
const DemoBanners = lazy(() => import('./components/Banner/DemoBanners'));
const DemoTags = lazy(() => import('./components/Tag/DemoTags'));
const DemoModals = lazy(() => import('./components/Modal/DemoModals'));
const DemoTabs = lazy(() => import('./components/Tab/DemoTabs'));
const DemoText = lazy(() => import('./components/Text/DemoText'));
const DemoSiteFrame = lazy(() => import('./components/SiteFrame/DemoSiteFrame'));
const DemoMenus = lazy(() => import('./components/Menu/DemoMenus'));
const DemoIndex = lazy(() => import('./components/Demo/DemoIndex'));
const DemoTables = lazy(() => import('./components/Tables/DemoTables'));

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
        <Route path="/demo/menus" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoMenus />
          </Suspense>
        } />
        <Route path="/demo/tables" element={
          <Suspense fallback={<div>Cargando demo...</div>}>
            <DemoTables />
          </Suspense>
        } />
        {/* Rutas públicas mínimas */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Rutas de administración */}
        <Route path="/admin/dashboard" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminDummy />
          </Suspense>
        } />
        <Route path="/admin/citas" element={<Navigate to="/admin/citas-agendadas" replace />} />
        <Route path="/admin/citas-agendadas" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminCitasAgendadas />
          </Suspense>
        } />
        <Route path="/admin/horarios" element={<Navigate to="/admin/horarios" replace />} />
        <Route path="/admin/horarios" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminHorarios />
          </Suspense>
        } />
        <Route path="/admin/especialidades" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminDummy />
          </Suspense>
        } />
        <Route path="/admin/servicios" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminDummy />
          </Suspense>
        } />
        <Route path="/admin/convenios" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminDummy />
          </Suspense>
        } />
        <Route path="/admin/examenes" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminDummy />
          </Suspense>
        } />
        <Route path="/admin/cotizaciones" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminDummy />
          </Suspense>
        } />
        <Route path="/admin/usuarios" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AdminDummy />
          </Suspense>
        } />
        
        {/* Ruta para redirigir 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;