import api from './api';

/**
 * Servicio de Autenticación
 * Maneja registro, login, perfil y gestión de sesión
 */
class AuthService {
  /**
   * Registra un nuevo usuario en el sistema
   * @param {string} nombre - Nombre completo del usuario
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @param {string} rol - Rol del usuario (por defecto 'usuario')
   * @returns {Promise<Object>} Datos del usuario registrado con token
   */
  async registro(nombre, email, password, rol = 'usuario') {
    try {
      const { data } = await api.post('/auth/registro', { 
        nombre, 
        email, 
        password,
        rol 
      });
      
      if (data.success) {
        this.guardarSesion(data.data);
      }
      
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Inicia sesión con email y contraseña
   * @param {string} email - Email del usuario
   * @param {string} password - Contraseña
   * @returns {Promise<Object>} Datos del usuario con token
   */
  async login(email, password) {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      if (data.success) {
        this.guardarSesion(data.data);
      }
      
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   * @returns {Promise<Object>} Datos del perfil del usuario
   */
  async obtenerPerfil() {
    try {
      const { data } = await api.get('/auth/me');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Guarda los datos de sesión en localStorage
   * @param {Object} userData - Datos del usuario incluyendo token
   */
  guardarSesion(userData) {
    if (userData.token) {
      localStorage.setItem('token', userData.token);
    }
    localStorage.setItem('user', JSON.stringify(userData));
  }

  /**
   * Cierra la sesión del usuario
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }

  /**
   * Obtiene el token JWT del localStorage
   * @returns {string|null} Token JWT o null
   */
  obtenerToken() {
    return localStorage.getItem('token');
  }

  /**
   * Obtiene los datos del usuario del localStorage
   * @returns {Object|null} Datos del usuario o null
   */
  obtenerUsuario() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /**
   * Verifica si hay un usuario autenticado
   * @returns {boolean} true si está autenticado
   */
  estaAutenticado() {
    return !!this.obtenerToken();
  }

  /**
   * Verifica si el usuario tiene rol de administrador
   * @returns {boolean} true si es admin
   */
  esAdmin() {
    const user = this.obtenerUsuario();
    return user?.rol === 'admin';
  }

  /**
   * Verifica si el usuario tiene rol específico
   * @param {string} rol - Rol a verificar
   * @returns {boolean} true si tiene el rol
   */
  tieneRol(rol) {
    const user = this.obtenerUsuario();
    return user?.rol === rol;
  }
}

// Exportar una instancia única (Singleton)
export default new AuthService();
