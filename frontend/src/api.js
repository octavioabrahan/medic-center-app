// src/api.js
import axios from "axios";

// Sistema de caché simple para reducir solicitudes repetidas
const cache = {
  data: {},
  timestamp: {},
  // Tiempo de caché en milisegundos (5 minutos)
  cacheTime: 5 * 60 * 1000
};

// Cliente axios con interceptores para caché y reintentos
export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Función para obtener datos con caché
export const fetchWithCache = async (url, forceRefresh = false) => {
  // Si tenemos datos en caché y no ha expirado y no se solicita refresco forzado
  if (
    !forceRefresh && 
    cache.data[url] && 
    cache.timestamp[url] && 
    (Date.now() - cache.timestamp[url] < cache.cacheTime)
  ) {
    console.log(`Usando datos en caché para ${url}`);
    return { data: cache.data[url] };
  }

  try {
    // Si no hay caché o ha expirado, hacer la petición
    const response = await apiClient.get(url);
    
    // Guardar en caché
    cache.data[url] = response.data;
    cache.timestamp[url] = Date.now();
    
    return response;
  } catch (error) {
    // Si hay error 429, devolver caché incluso si expiró
    if (error.response && error.response.status === 429 && cache.data[url]) {
      console.warn(`Error 429, usando datos en caché para ${url} aunque hayan expirado`);
      return { data: cache.data[url] };
    }
    throw error;
  }
};

// Agregar mecanismo de reintento para errores 429
apiClient.interceptors.response.use(
  response => response,
  async error => {
    const { config, response } = error;
    
    // Si es error 429 (Too Many Requests) y no hemos reintentado más de 3 veces
    if (
      response &&
      response.status === 429 && 
      config && 
      config.retryCount < 3
    ) {
      // Aumentar contador de reintentos
      config.retryCount = config.retryCount ? config.retryCount + 1 : 1;
      
      // Esperar tiempo incremental antes de reintentar (2s, 4s, 6s)
      const delay = config.retryCount * 2000;
      console.log(`Error 429: Reintentando en ${delay/1000}s (intento ${config.retryCount}/3)`);
      
      return new Promise(resolve => {
        setTimeout(() => resolve(apiClient(config)), delay);
      });
    }
    
    return Promise.reject(error);
  }
);

// Inicializar contador de reintentos en las solicitudes
apiClient.interceptors.request.use(
  config => {
    config.retryCount = 0;
    return config;
  },
  error => Promise.reject(error)
);

// Cliente axios con interceptores para autenticación - ESTE ES EL IMPORTANTE PARA AUTENTICACIÓN
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

export { auth, api };
// Exportando api como default para mantener compatibilidad con código existente
export default api;
