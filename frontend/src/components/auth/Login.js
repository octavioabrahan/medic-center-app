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
      // Primera intentamos con la función auth.login normal
      try {
        console.log("Intentando con auth.login:", { email });
        await auth.login(email, password);
        window.location.href = "/admin";
        return;
      } catch (error) {
        console.log("Primer método falló, intentando directo con axios");
      }

      // Si falla, intentamos con axios directamente
      console.log("Intentando login directo:", { email });
      const response = await axios.post("/api/auth/login", { 
        email, 
        password 
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      console.log("Respuesta login directo:", response.data);
      
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.usuario));
        window.location.href = "/admin";
      }
    } catch (err) {
      console.error("Error de login:", err);
      if (err.response && err.response.data) {
        setError(err.response.data.error || "Error al iniciar sesión");
      } else {
        setError("Error al conectar con el servidor");
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