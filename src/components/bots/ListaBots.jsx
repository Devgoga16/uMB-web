import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Settings, Power, Trash2, Edit, FileCode, Search, Filter, Grid, List, SortAsc } from 'lucide-react';
import botService from '../../services/botService';
import ModalEnv from './ModalEnv';
import '../../styles/ListaBots.css';

/**
 * Componente para mostrar la lista de bots con búsqueda, filtros y vistas
 * Incluye: Cards/Tabla, búsqueda, filtros por estado, ordenamiento
 */
function ListaBots({ onEdit, onRefresh }) {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [botSeleccionado, setBotSeleccionado] = useState(null);
  const [mostrarModalEnv, setMostrarModalEnv] = useState(false);
  
  // Estados para búsqueda y filtros
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [ordenamiento, setOrdenamiento] = useState('nombre');
  const [vistaActual, setVistaActual] = useState('cards'); // 'cards' o 'tabla'

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

  // Filtrado y búsqueda con useMemo para optimizar
  const botsFiltrados = useMemo(() => {
    let resultado = [...bots];

    // Búsqueda por nombre
    if (busqueda.trim()) {
      resultado = resultado.filter(bot =>
        bot.nombre.toLowerCase().includes(busqueda.toLowerCase())
      );
    }

    // Filtro por estado
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(bot => bot.estado === filtroEstado);
    }

    // Ordenamiento
    resultado.sort((a, b) => {
      switch (ordenamiento) {
        case 'nombre':
          return a.nombre.localeCompare(b.nombre);
        case 'fecha':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'estado':
          return a.estado.localeCompare(b.estado);
        default:
          return 0;
      }
    });

    return resultado;
  }, [bots, busqueda, filtroEstado, ordenamiento]);

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

  // Renderizar tarjeta de bot
  const renderBotCard = (bot) => (
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
  );

  // Renderizar fila de tabla
  const renderBotRow = (bot) => (
    <tr 
      key={bot._id} 
      className={`bot-row ${bot.estado}`}
      onClick={() => navigate(`/bots/${bot._id}`)}
      style={{ cursor: 'pointer' }}
    >
      <td>
        <div className="bot-cell-name">
          <div className="bot-icon-small">
            <Bot size={18} />
          </div>
          <div>
            <div className="bot-name">{bot.nombre}</div>
            <div className="bot-plan-small">{bot.plan?.tipo || 'Básico'}</div>
          </div>
        </div>
      </td>
      <td>
        <span className={`badge badge-${bot.estado}`}>
          {bot.estado}
        </span>
      </td>
      <td>S/ {bot.plan?.precio || 0}</td>
      <td>{bot.plan?.limites?.mensajesWhatsApp || 0}</td>
      <td>{bot.plan?.limites?.correos || 0}</td>
      <td>{new Date(bot.createdAt).toLocaleDateString('es-ES')}</td>
      <td>
        <div className="bot-actions-table" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => handleMostrarEnv(bot)}
            className="btn-icono-table"
            title="Ver .env"
          >
            <FileCode size={16} />
          </button>
          <button
            onClick={() => onEdit(bot)}
            className="btn-icono-table"
            title="Editar"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleToggleEstado(bot._id, bot.estado)}
            className="btn-icono-table"
            title={bot.estado === 'activo' ? 'Desactivar' : 'Activar'}
          >
            <Power size={16} />
          </button>
          <button
            onClick={() => handleEliminar(bot._id, bot.nombre)}
            className="btn-icono-table btn-eliminar"
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );

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
      {/* Barra de herramientas */}
      <div className="bots-toolbar">
        {/* Búsqueda */}
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="search-input"
          />
          {busqueda && (
            <button 
              className="clear-search"
              onClick={() => setBusqueda('')}
              title="Limpiar búsqueda"
            >
              ×
            </button>
          )}
        </div>

        {/* Filtros y controles */}
        <div className="toolbar-controls">
          <div className="filter-group">
            <Filter size={16} />
            <select 
              value={filtroEstado} 
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="filter-select"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
            </select>
          </div>

          <div className="filter-group">
            <SortAsc size={16} />
            <select 
              value={ordenamiento} 
              onChange={(e) => setOrdenamiento(e.target.value)}
              className="filter-select"
            >
              <option value="nombre">Ordenar por nombre</option>
              <option value="fecha">Ordenar por fecha</option>
              <option value="estado">Ordenar por estado</option>
            </select>
          </div>

          {/* Toggle de vista */}
          <div className="view-toggle">
            <button
              className={`toggle-btn ${vistaActual === 'cards' ? 'active' : ''}`}
              onClick={() => setVistaActual('cards')}
              title="Vista de cards"
            >
              <Grid size={18} />
            </button>
            <button
              className={`toggle-btn ${vistaActual === 'tabla' ? 'active' : ''}`}
              onClick={() => setVistaActual('tabla')}
              title="Vista de tabla"
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="results-count">
        Mostrando {botsFiltrados.length} de {bots.length} bot{bots.length !== 1 ? 's' : ''}
      </div>

      {/* Vista de Cards */}
      {vistaActual === 'cards' && (
        <div className="bots-grid">
          {botsFiltrados.map((bot) => renderBotCard(bot))}
        </div>
      )}

      {/* Vista de Tabla */}
      {vistaActual === 'tabla' && (
        <div className="bots-table-container">
          <table className="bots-table">
            <thead>
              <tr>
                <th>Bot</th>
                <th>Estado</th>
                <th>Precio</th>
                <th>WhatsApp</th>
                <th>Correos</th>
                <th>Creado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {botsFiltrados.map((bot) => renderBotRow(bot))}
            </tbody>
          </table>
        </div>
      )}

      {/* Sin resultados */}
      {botsFiltrados.length === 0 && (
        <div className="no-results">
          <Search size={48} />
          <p>No se encontraron bots</p>
          <p className="empty-subtitle">
            {busqueda ? `No hay bots que coincidan con "${busqueda}"` : 'Intenta con otros filtros'}
          </p>
          <button 
            className="btn-clear-filters"
            onClick={() => {
              setBusqueda('');
              setFiltroEstado('todos');
            }}
          >
            Limpiar filtros
          </button>
        </div>
      )}

      {/* Modal de .env */}
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
