import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Bell, 
  TrendingUp,
  CheckCircle2,
  Activity,
  Clock,
  BarChart3,
  Settings
} from 'lucide-react';
import authService from '../services/authService';
import Layout from '../components/Layout';
import '../styles/Dashboard.css';

function Dashboard() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authService.estaAutenticado()) {
      navigate('/');
    } else {
      const user = authService.obtenerUsuario();
      setUsername(user?.nombre || user?.email || 'Usuario');
    }
  }, [navigate]);

  return (
    <Layout>
      <header className="dashboard-header">
        <h1>Bienvenido al Dashboard</h1>
        <p>Sistema de Gestión Unificada</p>
      </header>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon stat-icon-users">
              <Users size={28} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Usuarios Activos</p>
              <h3 className="stat-value">1,234</h3>
              <span className="stat-change positive">
                <TrendingUp size={14} /> +12.5%
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-operations">
              <Activity size={28} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Operaciones Hoy</p>
              <h3 className="stat-value">856</h3>
              <span className="stat-change positive">
                <TrendingUp size={14} /> +8.2%
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-tasks">
              <CheckCircle2 size={28} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Tareas Completadas</p>
              <h3 className="stat-value">342</h3>
              <span className="stat-change positive">
                <TrendingUp size={14} /> +5.4%
              </span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-notifications">
              <Bell size={28} />
            </div>
            <div className="stat-info">
              <p className="stat-label">Notificaciones</p>
              <h3 className="stat-value">18</h3>
              <span className="stat-change neutral">
                Pendientes
              </span>
            </div>
          </div>
        </div>

        <div className="content-grid">
          <div className="content-card">
            <h3>
              <Clock size={20} />
              Actividad Reciente
            </h3>
            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <Users size={16} />
                </div>
                <div className="activity-content">
                  <span className="activity-time">Hace 5 min</span>
                  <p>Nuevo usuario registrado</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <BarChart3 size={16} />
                </div>
                <div className="activity-content">
                  <span className="activity-time">Hace 12 min</span>
                  <p>Reporte generado exitosamente</p>
                </div>
              </div>
              <div className="activity-item">
                <div className="activity-icon">
                  <Settings size={16} />
                </div>
                <div className="activity-content">
                  <span className="activity-time">Hace 30 min</span>
                  <p>Sistema actualizado</p>
                </div>
              </div>
            </div>
          </div>

          <div className="content-card">
            <h3>
              <CheckCircle2 size={20} />
              Tareas Pendientes
            </h3>
            <div className="task-list">
              <div className="task-item">
                <input type="checkbox" id="task1" />
                <label htmlFor="task1">Revisar reportes mensuales</label>
                <span className="task-badge priority">Alta</span>
              </div>
              <div className="task-item">
                <input type="checkbox" id="task2" />
                <label htmlFor="task2">Actualizar base de datos</label>
                <span className="task-badge normal">Media</span>
              </div>
              <div className="task-item">
                <input type="checkbox" id="task3" />
                <label htmlFor="task3">Configurar notificaciones</label>
                <span className="task-badge low">Baja</span>
              </div>
            </div>
          </div>
        </div>
    </Layout>
  );
}

export default Dashboard;
