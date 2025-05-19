import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './api';
import { AuthProvider } from './context/AuthContext';

// Higher-order component para rutas protegidas
const RequireAuth = ({ children }) => {
  const isAuthenticated = auth.isAuthenticated();
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log("RequireAuth: Verificando autenticación", { isAuthenticated, path: location.pathname });
  
  // Hooks deben ser llamados en el mismo orden en cada renderizado
  // Por eso movemos useEffect antes de cualquier return condicional
  useEffect(() => {
    // Re-verificar autenticación cada vez que el componente se monta o la ruta cambia
    const checkAuth = () => {
      const isStillAuth = auth.isAuthenticated();
      if (!isStillAuth) {
        console.log("RequireAuth useEffect: Token expirado o eliminado");
        navigate('/login', { state: { from: location }, replace: true });
      }
    };
    
    checkAuth();
    
    // También podríamos configurar un intervalo para verificar periódicamente
    const interval = setInterval(checkAuth, 60000); // Verificar cada minuto
    
    return () => clearInterval(interval);
  }, [location, navigate]);
  
  // Verificación inicial - debe estar después de los hooks
  if (!isAuthenticated) {
    // Redirigir al login, guardando la ubicación actual para redirigir después del login
    console.log("RequireAuth: Usuario no autenticado, redirigiendo a login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log("RequireAuth: Usuario autenticado, permitiendo acceso");
  return children;
};

// Lazy load para páginas de administración
const AdminDummy = lazy(() => import('./pages/admin/AdminDummy'));
const AdminCitasAgendadas = lazy(() => import('./pages/admin/AdminCitasAgendadas'));
const AdminHorarios = lazy(() => import('./pages/admin/AdminHorarios/AdminHorarios'));
const AdminProfesionales = lazy(() => import('./pages/admin/AdminProfesionales'));
const AdminServicios = lazy(() => import('./pages/admin/AdminServicios/AdminServicios'));
const AdminConvenios = lazy(() => import('./pages/admin/AdminConvenios/AdminConvenios'));
const AdminCotizaciones = lazy(() => import('./pages/admin/AdminCotizaciones/AdminCotizaciones'));
const AdminExamenes = lazy(() => import('./pages/admin/AdminExamenes/AdminExamenes'));

// Lazy load para autenticación
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

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
      <AuthProvider>
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
        
        {/* Ruta de login */}
        <Route path="/login" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <LoginPage />
          </Suspense>
        } />
        
        {/* Ruta de acceso denegado */}
        <Route path="/forbidden" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <div style={{ padding: '40px', textAlign: 'center' }}>
              <h1>Acceso Denegado</h1>
              <p>No tiene permisos para acceder a esta sección.</p>
            </div>
          </Suspense>
        } />

        {/* Rutas de administración protegidas */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminDummy />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/citas" element={<Navigate to="/admin/citas-agendadas" replace />} />
        <Route path="/admin/citas-agendadas" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminCitasAgendadas />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/horarios" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminHorarios />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/especialidades" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminDummy />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/profesionales" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminProfesionales />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/servicios" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminServicios />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/convenios" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminConvenios />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/examenes" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminExamenes />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/cotizaciones" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminCotizaciones />
            </Suspense>
          </RequireAuth>
        } />
        <Route path="/admin/usuarios" element={
          <RequireAuth>
            <Suspense fallback={<div>Cargando...</div>}>
              <AdminDummy />
            </Suspense>
          </RequireAuth>
        } />
        
        {/* Ruta para redirigir 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;