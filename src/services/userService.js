import api from './api';

/**
 * Servicio de Gestión de Usuarios
 * Maneja operaciones CRUD de usuarios (Solo para administradores)
 */
class UserService {
  /**
   * Obtiene la lista completa de usuarios
   * @returns {Promise<Object>} Lista de usuarios
   */
  async obtenerTodos() {
    try {
      const { data } = await api.get('/users');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Obtiene un usuario específico por ID
   * @param {string} id - ID del usuario
   * @returns {Promise<Object>} Datos del usuario
   */
  async obtenerPorId(id) {
    try {
      const { data } = await api.get(`/users/${id}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Crea un nuevo usuario
   * @param {Object} userData - Datos del nuevo usuario
   * @param {string} userData.nombre - Nombre del usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña
   * @param {string} userData.rol - Rol del usuario
   * @returns {Promise<Object>} Usuario creado
   */
  async crear(userData) {
    try {
      const { data } = await api.post('/users', userData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Actualiza la información de un usuario
   * @param {string} id - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  async actualizar(id, userData) {
    try {
      const { data } = await api.put(`/users/${id}`, userData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Elimina un usuario del sistema
   * @param {string} id - ID del usuario a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async eliminar(id) {
    try {
      const { data } = await api.delete(`/users/${id}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Cambia el estado activo de un usuario
   * @param {string} id - ID del usuario
   * @param {boolean} activo - Nuevo estado
   * @returns {Promise<Object>} Usuario actualizado
   */
  async cambiarEstado(id, activo) {
    try {
      const { data } = await api.put(`/users/${id}`, { activo });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Cambia el rol de un usuario
   * @param {string} id - ID del usuario
   * @param {string} rol - Nuevo rol
   * @returns {Promise<Object>} Usuario actualizado
   */
  async cambiarRol(id, rol) {
    try {
      const { data } = await api.put(`/users/${id}`, { rol });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

// Exportar una instancia única (Singleton)
export default new UserService();
