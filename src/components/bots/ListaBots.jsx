import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Settings, Power, Trash2, Edit, FileCode } from 'lucide-react';
import botService from '../../services/botService';
import ModalEnv from './ModalEnv';
import '../../styles/ListaBots.css';

/**
 * Componente para mostrar la lista de bots en tarjetas
 * Actualizado con modal de .env
 */
function ListaBots({ onEdit, onRefresh }) {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [botSeleccionado, setBotSeleccionado] = useState(null);
  const [mostrarModalEnv, setMostrarModalEnv] = useState(false);

  useEffect(() => {
    cargarBots();
  }, [onRefresh]);

  const cargarBots = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await botService.obtenerTodos();
      setBots(response.data);
    } catch (error) {
      console.error('Error al cargar bots:', error);
      // Datos de prueba si el backend no está disponible
      setBots([{
        _id: '1',
        nombre: 'Bot de Prueba',
        url: 'https://bot.test.com',
        apiKey: 'sk_live_test123',
        baseDatos: 'test_db',
        email: 'test@test.com',
        password: 'testpass123',
        estado: 'activo',
        plan: {
          tipo: 'standard',
          precio: 100,
          limites: { mensajesWhatsApp: 1000, correos: 500 },
          costosExtras: { mensajeWhatsApp: 0.10, correo: 0.05 }
        },
        createdAt: new Date().toISOString()
      }]);
      setError('Mostrando datos de prueba - Backend no disponible');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar el bot "${nombre}"?`)) {
      return;
    }

    try {
      await botService.eliminar(id);
      alert('Bot eliminado exitosamente');
      cargarBots();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error.mensaje || 'Error al eliminar bot');
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      const nuevoEstado = estadoActual === 'activo' ? 'inactivo' : 'activo';
      await botService.cambiarEstado(id, nuevoEstado);
      alert(`Bot ${nuevoEstado === 'activo' ? 'activado' : 'desactivado'} exitosamente`);
      cargarBots();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert(error.mensaje || 'Error al cambiar estado');
    }
  };

  const handleMostrarEnv = (bot) => {
    setBotSeleccionado(bot);
    setMostrarModalEnv(true);
  };

  const handleCerrarModalEnv = () => {
    setMostrarModalEnv(false);
    setBotSeleccionado(null);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando bots...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">
          <Bot size={20} /> {error}
        </p>
        <button onClick={cargarBots} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  if (bots.length === 0) {
    return (
      <div className="empty-state">
        <Bot size={48} />
        <p>No hay bots configurados</p>
        <p className="empty-subtitle">Comienza agregando tu primer bot</p>
      </div>
    );
  }

  return (
    <div className="lista-bots">
      <div className="bots-grid">
        {bots.map((bot) => (
          <div 
            key={bot._id} 
            className={`bot-card ${bot.estado}`}
            onClick={() => navigate(`/bots/${bot._id}`)}
            style={{ cursor: 'pointer' }}
          >
            <div className="bot-card-header">
              <div className="bot-icon">
                <Bot size={24} />
              </div>
              <div className="bot-info">
                <h3>{bot.nombre}</h3>
                <span className="bot-tipo">{bot.plan?.tipo || 'Plan básico'}</span>
              </div>
              <span className={`badge badge-${bot.estado}`}>
                {bot.estado}
              </span>
            </div>

            <div className="bot-card-body">
              <div className="bot-stat">
                <span className="stat-label">Plan:</span>
                <span className="stat-value">{bot.plan?.tipo || 'Standard'}</span>
              </div>
              <div className="bot-stat">
                <span className="stat-label">Precio:</span>
                <span className="stat-value">S/ {bot.plan?.precio || 0}</span>
              </div>
              <div className="bot-stat">
                <span className="stat-label">Límite WhatsApp:</span>
                <span className="stat-value">{bot.plan?.limites?.mensajesWhatsApp || 0} mensajes</span>
              </div>
              <div className="bot-stat">
                <span className="stat-label">Límite Correos:</span>
                <span className="stat-value">{bot.plan?.limites?.correos || 0} correos</span>
              </div>
              <div className="bot-stat">
                <span className="stat-label">Creado:</span>
                <span className="stat-value">
                  {new Date(bot.createdAt).toLocaleDateString('es-ES')}
                </span>
              </div>
            </div>

            <div className="bot-card-footer">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleMostrarEnv(bot);
                }}
                className="btn-icono btn-env"
                title="Ver configuración .env"
              >
                <FileCode size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(bot);
                }}
                className="btn-icono btn-editar"
                title="Editar"
              >
                <Edit size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleEstado(bot._id, bot.estado);
                }}
                className={`btn-icono ${bot.estado === 'activo' ? 'btn-desactivar' : 'btn-activar'}`}
                title={bot.estado === 'activo' ? 'Desactivar' : 'Activar'}
              >
                <Power size={16} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEliminar(bot._id, bot.nombre);
                }}
                className="btn-icono btn-eliminar"
                title="Eliminar"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {mostrarModalEnv && botSeleccionado && (
        <ModalEnv 
          bot={botSeleccionado} 
          onClose={handleCerrarModalEnv}
        />
      )}
    </div>
  );
}

export default ListaBots;
