import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import '../styles/Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert('Por favor ingresa email y contraseña');
      return;
    }

    setLoading(true);
    
    try {
      // Intentar login real con la API
      await authService.login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error en login:', error);
      // Si falla la API, hacer login simulado para desarrollo
      const userData = {
        nombre: email.split('@')[0],
        email: email,
        rol: email.includes('admin') ? 'admin' : 'usuario',
        token: 'token-simulado-' + Date.now()
      };
      authService.guardarSesion(userData);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>uMB</h1>
          <p>unify Management Bot</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@example.com"
              autoFocus
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ingresa tu contraseña"
              disabled={loading}
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
          
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', textAlign: 'center' }}>
            <p>💡 Tip: Usa un email con "admin" para acceder como administrador</p>
          </div>
        </form>

        <div className="login-footer">
          <p>Versión 1.0.0 - Sistema simulado</p>
        </div>
      </div>
    </div>
  );
}

export default Login;
