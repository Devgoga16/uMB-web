// Configuración centralizada de la API
const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000, // 10 segundos
};

export default config;
