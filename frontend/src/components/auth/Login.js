import React, { useState } from "react";
import { auth } from "../../api";
import "./Auth.css";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("Iniciando proceso de login con:", { email });
      const result = await auth.login(email, password);
      console.log("Login exitoso:", result);
      
      // Redirección tras login exitoso
      window.location.href = "/admin";
    } catch (err) {
      console.error("Error de login:", err);
      if (err.response && err.response.data) {
        // Mostrar el error específico del servidor
        setError(err.response.data.error || "Error al iniciar sesión");
        
        // Si la cuenta está bloqueada, mostrar mensaje con tiempo
        if (err.response.data.lockExpiry) {
          const lockTime = new Date(err.response.data.lockExpiry);
          const now = new Date();
          const minutesLeft = Math.ceil((lockTime - now) / (1000 * 60));
          
          setError(`Cuenta bloqueada temporalmente. Intente nuevamente en ${minutesLeft} minutos.`);
        }
      } else {
        setError("Error al conectar con el servidor. Verifique su conexión a internet.");
      }
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