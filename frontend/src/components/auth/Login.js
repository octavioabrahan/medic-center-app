import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth } from "../../api";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to /admin
  const from = location.state?.from?.pathname || "/admin";

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
      
      // Redirección tras login exitoso - a la página original donde el usuario intentó acceder
      navigate(from, { replace: true });
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
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
}

export default Login;