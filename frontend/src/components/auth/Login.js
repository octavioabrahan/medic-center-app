import React, { useState } from "react";
import { auth } from "../../api";
import axios from "axios";
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
      
      // Limpiar cualquier token previo para evitar conflictos
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      try {
        // Intento de login usando la API configurada
        console.log("Intentando con auth.login...");
        const userData = await auth.login(email, password);
        
        console.log("Respuesta de login:", userData);
        if (!userData || !userData.token) {
          throw new Error("La respuesta del servidor no contiene un token válido");
        }
        
        // Guardar el token explícitamente con el prefijo Bearer para uso posterior
        localStorage.setItem("authToken", userData.token);
        localStorage.setItem("user", JSON.stringify(userData.usuario));
        
        // Verificar que el token se guardó correctamente
        const savedToken = localStorage.getItem("authToken");
        console.log("Token guardado correctamente:", !!savedToken);
        
        if (!savedToken) {
          throw new Error("No se pudo guardar el token en localStorage");
        }
        
        // Configurar axios para que use el token en peticiones futuras
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        
        console.log("Redirigiendo al panel de administración...");
        window.location.href = "/admin";
        return;
      } catch (authError) {
        console.error("Error con auth.login:", authError);
        // Seguir con el siguiente método si este falla
      }

      // Intento alternativo con axios directo
      console.log("Intentando login directo con axios...");
      const response = await axios.post("/api/auth/login", { email, password }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Respuesta login directo:", response.data);
      
      if (response.data && response.data.token) {
        // Guardar el token con el prefijo Bearer para uso posterior
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.usuario));
        
        // Verificar que se guardó
        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Error al guardar la sesión en localStorage");
        }
        
        // Configurar axios para peticiones futuras
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        console.log("Redirigiendo al panel de administración...");
        window.location.href = "/admin";
      } else {
        throw new Error("La respuesta no contiene un token");
      }
    } catch (err) {
      console.error("Error durante el proceso de login:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Error al iniciar sesión");
      } else {
        setError(err.message || "Error al conectar con el servidor");
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

        {error && <div className="auth-error">{error}</div>}

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
            className="auth-button" 
            disabled={loading}
          >
            {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;