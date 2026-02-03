import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Activity, 
  Database, 
  MessageSquare, 
  Mail,
  CheckCircle,
  XCircle,
  TrendingUp,
  Calendar,
  Eye,
  EyeOff,
  Copy,
  Send,
  Code
} from 'lucide-react';
import axios from 'axios';
import botService from '../services/botService';
import Modal from '../components/Modal';
import Layout from '../components/Layout';
import '../styles/DetalleBot.css';

/**
 * Página de detalles y estadísticas del bot
 */
function DetalleBot() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bot, setBot] = useState(null);
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarApiKey, setMostrarApiKey] = useState(false);
  
  // Estados para el modal de WhatsApp
  const [modalWhatsApp, setModalWhatsApp] = useState(false);
  const [numeroDestino, setNumeroDestino] = useState('');
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState(null);

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);

    try {
      // Cargar información del bot
      const response = await botService.obtenerTodos();
      const botEncontrado = response.data.find(b => b._id === id);
      
      if (!botEncontrado) {
        setError('Bot no encontrado');
        setLoading(false);
        return;
      }

      setBot(botEncontrado);

      // Crear instancia de axios con la URL base del bot
      const botApi = axios.create({
        baseURL: botEncontrado.url,
        headers: {
          'x-api-key': botEncontrado.apiKey,
          'accept': 'application/json'
        }
      });

      // Cargar datos en paralelo
      const [healthRes, summaryRes, usageRes] = await Promise.allSettled([
        botApi.get('/api/health'),
        botApi.get('/api/stats/summary'),
        botApi.get('/api/stats/usage')
      ]);

      if (healthRes.status === 'fulfilled') {
        setHealth(healthRes.value.data);
      }

      if (summaryRes.status === 'fulfilled') {
        setSummary(summaryRes.value.data);
      }

      if (usageRes.status === 'fulfilled') {
        setUsage(usageRes.value.data);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar información del bot');
    } finally {
      setLoading(false);
    }
  };

  const copiarApiKey = () => {
    navigator.clipboard.writeText(bot.apiKey);
    toast.success('API Key copiada al portapapeles');
  };

  const enviarMensajeWhatsApp = async (e) => {
    e.preventDefault();
    setEnviandoMensaje(true);
    setResultadoEnvio(null);

    try {
      const response = await axios.post(
        `${bot.url}/api/whatsapp/send`,
        {
          to: numeroDestino,
          message: mensajeTexto
        },
        {
          headers: {
            'accept': '*/*',
            'x-api-key': bot.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      // Formatear la fecha de envío
      const fechaEnvio = new Date(response.data.data.sentAt);
      const horaEnvio = fechaEnvio.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      // Mostrar notificación con información detallada
      toast.success(
        `✓ Mensaje enviado a +${response.data.data.to} a las ${horaEnvio}`,
        {
          autoClose: 4000,
          style: {
            fontSize: '0.95rem'
          }
        }
      );
      
      // Limpiar formulario y cerrar modal
      setNumeroDestino('');
      setMensajeTexto('');
      setResultadoEnvio(null);
      setTimeout(() => {
        cerrarModalWhatsApp();
      }, 1500);
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      const errorMsg = error.response?.data?.message || 'Error al enviar el mensaje';
      toast.error(errorMsg);
      setResultadoEnvio(null);
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const abrirModalWhatsApp = () => {
    setModalWhatsApp(true);
    setResultadoEnvio(null);
  };

  const cerrarModalWhatsApp = () => {
    setModalWhatsApp(false);
    setNumeroDestino('');
    setMensajeTexto('');
    setResultadoEnvio(null);
  };

  const copiarCurl = () => {
    const curlCommand = `curl -X 'POST' \\
  '${bot.url}/api/whatsapp/send' \\
  -H 'accept: */*' \\
  -H 'x-api-key: ${bot.apiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "to": "955768897",
  "message": "Hola, este es un mensaje de prueba"
}'`;
    navigator.clipboard.writeText(curlCommand);
    toast.success('Comando curl copiado al portapapeles');
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando información del bot...</p>
        </div>
      </Layout>
    );
  }

  if (error || !bot) {
    return (
      <Layout>
        <div className="error-container">
          <p className="error-message">{error || 'Bot no encontrado'}</p>
          <button onClick={() => navigate('/bots')} className="btn btn-primary">
            Volver a Bots
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="detalle-bot-container">
        <div className="detalle-header">
        <button onClick={() => navigate('/bots')} className="btn-volver">
          <ArrowLeft size={20} /> Volver
        </button>
        <h1>{bot.nombre}</h1>
        <span className={`badge-estado badge-${bot.estado}`}>{bot.estado}</span>
        <button 
          onClick={() => window.open(`${bot.url}/api-docs`, '_blank')} 
          className="btn btn-primary"
          style={{ marginLeft: 'auto' }}
        >
          Ir a Swagger
        </button>
      </div>

      {/* API Key */}
      <div className="seccion-card api-key-section">
        <h2>API Key</h2>
        <div className="api-key-container">
          <div className="api-key-display">
            <code>{mostrarApiKey ? bot.apiKey : '•'.repeat(32)}</code>
          </div>
          <div className="api-key-actions">
            <button 
              onClick={() => setMostrarApiKey(!mostrarApiKey)}
              className="btn-icon"
              title={mostrarApiKey ? 'Ocultar' : 'Mostrar'}
            >
              {mostrarApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
            <button 
              onClick={copiarApiKey}
              className="btn-icon"
              title="Copiar"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
        <button 
          onClick={abrirModalWhatsApp}
          className="btn btn-primary"
          style={{ marginTop: '1rem' }}
        >
          <Send size={18} style={{ marginRight: '0.5rem' }} />
          Probar Envío WhatsApp
        </button>
      </div>

      {/* Estado de Salud */}
      {health && (
        <div className="seccion-card">
          <h2><Activity size={20} /> Estado de Salud</h2>
          <div className="health-grid">
            <div className="health-item">
              <span className="health-label">API</span>
              <span className={`health-status status-${health.checks?.api}`}>
                {health.checks?.api === 'ok' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {health.checks?.api || 'N/A'}
              </span>
            </div>
            <div className="health-item">
              <span className="health-label">Base de Datos</span>
              <span className={`health-status status-${health.checks?.database}`}>
                {health.checks?.database === 'ok' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {health.checks?.database || 'N/A'}
              </span>
            </div>
            <div className="health-item">
              <span className="health-label">WhatsApp</span>
              <span className={`health-status status-${health.checks?.whatsapp}`}>
                {health.checks?.whatsapp === 'connected' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {health.checks?.whatsapp || 'N/A'}
              </span>
            </div>
            <div className="health-item">
              <span className="health-label">Email</span>
              <span className={`health-status status-${health.checks?.email}`}>
                {health.checks?.email === 'ok' ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {health.checks?.email || 'N/A'}
              </span>
            </div>
          </div>

          <div className="account-status">
            <div className="status-item">
              <span>Cuenta Activa:</span>
              <span className={health.account?.active ? 'text-success' : 'text-danger'}>
                {health.account?.active ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="status-item">
              <span>Bloqueada:</span>
              <span className={health.account?.blocked ? 'text-danger' : 'text-success'}>
                {health.account?.blocked ? 'Sí' : 'No'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Uso del Mes Actual */}
      <div className="seccion-card">
        <h2><TrendingUp size={20} /> Uso del Mes Actual</h2>
        {usage && (
          <>
            <div className="mes-actual">
              <Calendar size={16} />
              <span>{usage.data?.month || 'N/A'}</span>
            </div>

            <div className="usage-grid">
              <div className="usage-card">
                <div className="usage-icon whatsapp">
                  <MessageSquare size={24} />
                </div>
                <h3>WhatsApp</h3>
                <div className="usage-stats">
                  <div className="stat-row">
                    <span className="stat-label">Enviados:</span>
                    <span className="stat-value">{usage.data?.whatsapp?.sent || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Límite:</span>
                    <span className="stat-value">{usage.data?.whatsapp?.limit || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Restantes:</span>
                    <span className="stat-value highlight">{usage.data?.whatsapp?.remaining || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Extras:</span>
                    <span className="stat-value">{usage.data?.whatsapp?.extra || 0}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill whatsapp"
                    style={{ 
                      width: `${((usage.data?.whatsapp?.sent || 0) / (usage.data?.whatsapp?.limit || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>

              <div className="usage-card">
                <div className="usage-icon email">
                  <Mail size={24} />
                </div>
                <h3>Correos</h3>
                <div className="usage-stats">
                  <div className="stat-row">
                    <span className="stat-label">Enviados:</span>
                    <span className="stat-value">{usage.data?.email?.sent || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Límite:</span>
                    <span className="stat-value">{usage.data?.email?.limit || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Restantes:</span>
                    <span className="stat-value highlight">{usage.data?.email?.remaining || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Extras:</span>
                    <span className="stat-value">{usage.data?.email?.extra || 0}</span>
                  </div>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill email"
                    style={{ 
                      width: `${((usage.data?.email?.sent || 0) / (usage.data?.email?.limit || 1)) * 100}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Resumen */}
      {summary && (
        <div className="seccion-card">
          <h2><Database size={20} /> Resumen General</h2>
          <div className="summary-info">
            <div className="summary-item">
              <span className="summary-label">WhatsApp Conectado:</span>
              <span className={summary.data?.account?.whatsappConnected ? 'text-success' : 'text-danger'}>
                {summary.data?.account?.whatsappConnected ? 'Sí' : 'No'}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Última Facturación:</span>
              <span>{summary.data?.lastBilling || 'Sin facturación'}</span>
            </div>
          </div>
        </div>
      )}

      <button onClick={cargarDatos} className="btn btn-secondary btn-refresh">
        Refrescar Datos
      </button>
      </div>

      {/* Modal de Prueba WhatsApp */}
      <Modal
        isOpen={modalWhatsApp}
        onClose={cerrarModalWhatsApp}
        title="Probar Envío WhatsApp"
        size="medium"
      >
        <form onSubmit={enviarMensajeWhatsApp} className="whatsapp-form">
          
          {/* Sección de Documentación cURL */}
          <div className="curl-section">
            <div className="curl-header">
              <h4>
                <Code size={18} />
                Ejemplo de uso con cURL
              </h4>
              <button 
                type="button"
                onClick={copiarCurl}
                className="btn-icon"
                title="Copiar cURL"
              >
                <Copy size={16} />
              </button>
            </div>
            <pre className="curl-code">
{`curl -X 'POST' \\
  '${bot.url}/api/whatsapp/send' \\
  -H 'accept: */*' \\
  -H 'x-api-key: ${bot.apiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "to": "955768897",
  "message": "Hola, este es un mensaje de prueba"
}'`}
            </pre>
            <div className="curl-info">
              <p><strong>Endpoint:</strong> POST {bot.url}/api/whatsapp/send</p>
              <p><strong>Headers requeridos:</strong></p>
              <ul>
                <li>x-api-key: {bot.apiKey}</li>
                <li>Content-Type: application/json</li>
              </ul>
              <p><strong>Body (JSON):</strong></p>
              <ul>
                <li>to: Número sin código de país</li>
                <li>message: Texto del mensaje</li>
              </ul>
            </div>
          </div>

          <div className="form-divider">
            <span>O prueba directamente aquí</span>
          </div>

          <div className="form-group">
            <label htmlFor="numeroDestino">
              Número de Destino <span className="required">*</span>
            </label>
            <input
              type="text"
              id="numeroDestino"
              value={numeroDestino}
              onChange={(e) => setNumeroDestino(e.target.value)}
              placeholder="Ej: 955768897"
              required
              disabled={enviandoMensaje}
              className="form-input"
            />
            <small className="form-hint">Sin código de país (+51)</small>
          </div>

          <div className="form-group">
            <label htmlFor="mensajeTexto">
              Mensaje <span className="required">*</span>
            </label>
            <textarea
              id="mensajeTexto"
              value={mensajeTexto}
              onChange={(e) => setMensajeTexto(e.target.value)}
              placeholder="Escribe tu mensaje aquí..."
              rows="4"
              required
              disabled={enviandoMensaje}
              className="form-textarea"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={cerrarModalWhatsApp}
              className="btn btn-secondary"
              disabled={enviandoMensaje}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={enviandoMensaje}
            >
              {enviandoMensaje ? (
                <>
                  <span className="spinner-small"></span> Enviando...
                </>
              ) : (
                <>
                  <Send size={18} /> Enviar Mensaje
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}

export default DetalleBot;
