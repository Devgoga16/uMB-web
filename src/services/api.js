import axios from 'axios';
import config from '../config/api.config';

// Crear instancia de axios con la URL base centralizada
const api = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token automáticamente a cada petición
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Si el token expiró o es inválido (401)
    if (error.response?.status === 401) {
      // Solo redirigir si NO estamos en la página de login
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    
    // Si no tiene permisos (403)
    if (error.response?.status === 403) {
      console.error('Acceso denegado: No tienes permisos para esta acción');
    }
    
    return Promise.reject(error);
  }
);

export default api;
