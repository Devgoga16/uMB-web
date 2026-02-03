import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  BarChart3, 
  LogOut,
  Bot
} from 'lucide-react';
import authService from '../services/authService';

/**
 * Componente Sidebar reutilizable para toda la aplicación
 */
function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuarioActual = authService.obtenerUsuario();
  const username = usuarioActual?.nombre || usuarioActual?.email || 'Usuario';

  const handleLogout = () => {
    authService.logout();
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  // Determinar qué vista está activa basándose en la ruta
  const isActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>uMB</h2>
        <p>Management Bot</p>
      </div>
      
      <nav className="sidebar-nav">
        <button 
          className={`nav-item ${isActive('/bots') ? 'active' : ''}`}
          onClick={() => handleNavigate('/bots')}
        >
          <Bot className="icon" size={20} />
          Bots
        </button>
        {usuarioActual?.rol === 'admin' && (
          <button 
            className={`nav-item ${isActive('/usuarios') ? 'active' : ''}`}
            onClick={() => handleNavigate('/usuarios')}
          >
            <Users className="icon" size={20} />
            Usuarios
          </button>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
          <div className="user-details">
            <p className="user-name">{username}</p>
            <p className="user-role">{authService.esAdmin() ? 'Administrador' : 'Usuario'}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="logout-button">
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
