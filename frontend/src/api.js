// src/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // gracias al proxy en package.json, apunta a localhost:3001
});

// Interceptor para incluir el token en todas las solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de autenticación
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si recibimos un 401 (Unauthorized), redirigir al login
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      // Si estamos en un entorno con React Router, redirigir al login
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// Funciones de autenticación
const auth = {
  login: async (email, password) => {
    try {
      console.log("Intentando login con:", { email }); // Debugging
      const response = await api.post("/auth/login", { email, password });
      console.log("Respuesta login:", response.data); // Debugging
      
      if (response.data.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.usuario));
      }
      return response.data;
    } catch (error) {
      console.error("Error en login:", error.response || error); // Debugging mejorado
      throw error;
    }
  },
  
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
  
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },
  
  // Volvemos a la implementación original que sabemos que funcionaba
  register: async (userData) => {
    console.log("Registrando usuario con datos:", userData); // Debugging
    try {
      const response = await api.post("/auth", userData);
      console.log("Respuesta registro:", response.data); // Debugging
      return response;
    } catch (error) {
      console.error("Error en registro:", error.response?.data || error);
      throw error;
    }
  },
  
  getProfile: async () => {
    return await api.get("/auth/perfil");
  },
  
  updateProfile: async (id, userData) => {
    return await api.put(`/auth/${id}`, userData);
  },
  
  changePassword: async (id, passwordData) => {
    return await api.post(`/auth/${id}/cambiar-password`, passwordData);
  }
};

export { auth };
export default api;
