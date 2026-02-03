import api from './api';

/**
 * Servicio de Gestión de Bots
 * Maneja operaciones CRUD de bots
 */
class BotService {
  /**
   * Obtiene la lista completa de bots
   * @returns {Promise<Object>} Lista de bots
   */
  async obtenerTodos() {
    try {
      const { data } = await api.get('/bots');
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Obtiene un bot específico por ID
   * @param {string} id - ID del bot
   * @returns {Promise<Object>} Datos del bot
   */
  async obtenerPorId(id) {
    try {
      const { data } = await api.get(`/bots/${id}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Crea un nuevo bot
   * @param {Object} botData - Datos del nuevo bot
   * @returns {Promise<Object>} Bot creado
   */
  async crear(botData) {
    try {
      const { data } = await api.post('/bots', botData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Actualiza la información de un bot
   * @param {string} id - ID del bot
   * @param {Object} botData - Datos a actualizar
   * @returns {Promise<Object>} Bot actualizado
   */
  async actualizar(id, botData) {
    try {
      const { data } = await api.put(`/bots/${id}`, botData);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Elimina un bot del sistema
   * @param {string} id - ID del bot a eliminar
   * @returns {Promise<Object>} Confirmación de eliminación
   */
  async eliminar(id) {
    try {
      const { data } = await api.delete(`/bots/${id}`);
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }

  /**
   * Cambia el estado de un bot
   * @param {string} id - ID del bot
   * @param {string} estado - Nuevo estado ('activo' o 'inactivo')
   * @returns {Promise<Object>} Bot actualizado
   */
  async cambiarEstado(id, estado) {
    try {
      const { data } = await api.put(`/bots/${id}`, { estado });
      return data;
    } catch (error) {
      throw error.response?.data || error;
    }
  }
}

// Exportar una instancia única (Singleton)
export default new BotService();
