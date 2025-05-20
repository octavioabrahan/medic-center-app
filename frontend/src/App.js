import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { auth } from './api';
import { AuthProvider } from './context/AuthContext';
import AdminAuthRedirector from './components/auth/AdminAuthRedirector';

// Higher-order component para rutas protegidas
const RequireAuth = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Realizar la verificación de autenticación en cada renderizado
  const isAuthenticated = auth.isAuthenticated();
  console.log("RequireAuth: Verificando autenticación", { 
    isAuthenticated, 
    path: location.pathname,
    token: localStorage.getItem('authToken') ? 'present' : 'missing'
  });
  
  // Hooks deben ser llamados en el mismo orden en cada renderizado
  useEffect(() => {
    // Verificar autenticación cuando el componente se monta
    const checkAuth = () => {
      const isStillAuth = auth.isAuthenticated();
      console.log("RequireAuth [useEffect]: Comprobando autenticación", { 
        isStillAuth, 
        path: location.pathname 
      });
      
      if (!isStillAuth) {
        console.log("RequireAuth [useEffect]: No autenticado, redirigiendo a login");
        // Forzamos redirección con window.location en vez de navigate 
        // para asegurar un refresco completo
        window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
      }
    };
    
    // Verificar inmediatamente
    checkAuth();
    
    // También verificamos periódicamente
    const interval = setInterval(checkAuth, 30000); // cada 30 segundos
    
    return () => clearInterval(interval);
  }, [location, navigate]);
  
  // Verificación inicial - FUERA del useEffect para bloquear renderizado inmediatamente
  if (!isAuthenticated) {
    console.log("RequireAuth: No autenticado en verificación inicial, redirigiendo a login");
    // Utilizamos el location state de React Router para recordar la ruta original
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log("RequireAuth: Usuario autenticado, permitiendo acceso");
  return children;
};

// Lazy load para páginas de administración
const AdminDummy = lazy(() => import('./pages/admin/AdminDummy'));
const AdminCitasAgendadas = lazy(() => import('./pages/admin/AdminCitasAgendadas/AdminCitasAgendadas'));
const AdminHorarios = lazy(() => import('./pages/admin/AdminHorarios/AdminHorarios'));
const AdminProfesionales = lazy(() => import('./pages/admin/AdminProfesionales'));
const AdminServicios = lazy(() => import('./pages/admin/AdminServicios/AdminServicios'));
const AdminConvenios = lazy(() => import('./pages/admin/AdminConvenios/AdminConvenios'));
const AdminCotizaciones = lazy(() => import('./pages/admin/AdminCotizaciones/AdminCotizaciones'));
const AdminExamenes = lazy(() => import('./pages/admin/AdminExamenes/AdminExamenes'));

// Lazy load para autenticación
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const AuthDebugger = lazy(() => import('./components/debug/AuthDebugger'));

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
        {/* Añadimos el interceptor global para rutas admin */}
        <AdminAuthRedirector />
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
        
        {/* Ruta de depuración de autenticación */}
        <Route path="/debug/auth" element={
          <Suspense fallback={<div>Cargando...</div>}>
            <AuthDebugger />
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

        {/* Cotizador público */}
        <Route path="/cotizador" element={
          <Suspense fallback={<div>Cargando cotizador...</div>}>
            {React.createElement(require('./components/public/CotizadorExamenes.js').default)}
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