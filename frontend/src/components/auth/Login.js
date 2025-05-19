import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { auth } from "../../api";
import Header from "../SiteFrame/Header";
import Footer from "../SiteFrame/Footer";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Obtener la ruta de redirección desde:
  // 1. El parámetro de consulta "redirect" en la URL
  // 2. La ubicación state de React Router
  // 3. Valor predeterminado "/admin"
  const redirectPath = 
    searchParams.get("redirect") || 
    location.state?.from?.pathname || 
    "/admin";
  
  // Comprobar si el usuario ya está autenticado
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = auth.isAuthenticated();
      console.log("Login - Verificando autenticación:", { isAuth });
      
      if (isAuth) {
        console.log("Login - Usuario ya autenticado, redirigiendo a:", redirectPath);
        navigate(redirectPath, { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate, redirectPath]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Iniciando proceso de login con:", { email });
      const result = await auth.login(email, password);
      console.log("Login exitoso:", result);
      
      // Verificamos que realmente tenemos un token después del login
      if (!auth.isAuthenticated()) {
        throw new Error("No se recibió un token de autenticación válido");
      }
      
      // Redirección tras login exitoso
      console.log("Redirigiendo a:", redirectPath);
      navigate(redirectPath, { replace: true });
    } catch (err) {
      console.error("Error de login detallado:", err);
      
      // Mensajes de error mejorados para depuración
      let errorMessage = "Error desconocido al iniciar sesión";
      
      if (err.response) {
        console.error("Respuesta del servidor:", {
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data
        });
        
        errorMessage = err.response.data?.error || 
                      `Error ${err.response.status}: ${err.response.statusText}`;
                      
        // Si la cuenta está bloqueada, mostrar mensaje con tiempo
        if (err.response.data?.lockExpiry) {
          const lockTime = new Date(err.response.data.lockExpiry);
          const now = new Date();
          const minutesLeft = Math.ceil((lockTime - now) / (1000 * 60));
          
          errorMessage = `Cuenta bloqueada temporalmente. Intente nuevamente en ${minutesLeft} minutos.`;
        }
      } else if (err.request) {
        console.error("No se recibió respuesta:", err.request);
        errorMessage = "No se recibió respuesta del servidor. Verifique su conexión.";
      } else {
        console.error("Error:", err.message);
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      
      // Mostrar los datos de local storage para depuración
      console.log("Estado del localStorage después del error:");
      console.log("- authToken:", localStorage.getItem("authToken"));
      console.log("- user:", localStorage.getItem("user"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Header />
      <div className="auth-container">
        <div className="auth-card">
        <div className="auth-header">
          <h2>Iniciar Sesión</h2>
          <p>Acceso al sistema administrativo</p>
        </div>

        {error && (
          <div className="auth-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            className={`auth-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
          
          {/* Añadir enlace para ayuda o contacto */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#666' }}>
            ¿Problemas para acceder? Contacte al administrador del sistema.
          </div>
        </form>
      </div>
      </div>
      <Footer />
    </div>
  );
}

export default Login;