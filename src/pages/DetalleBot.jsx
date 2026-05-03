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
  Code,
  FileText,
  Trash2,
  RefreshCw,
  ExternalLink,
  Key,
  BarChart3,
  FileCode2,
  CreditCard,
  Zap
} from 'lucide-react';
import axios from 'axios';
import botService from '../services/botService';
import Modal from '../components/Modal';
import Layout from '../components/Layout';
import SkeletonLoader from '../components/SkeletonLoader';
import '../styles/DetalleBot.css';

/**
 * Página de detalles y estadísticas del bot - REDISEÑADA
 */
function DetalleBot() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [bot, setBot] = useState(null);
  const [health, setHealth] = useState(null);
  const [summary, setSummary] = useState(null);
  const [usage, setUsage] = useState(null);
  const [billing, setBilling] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mostrarApiKey, setMostrarApiKey] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // nuevo estado para tabs
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para el modal de WhatsApp
  const [modalWhatsApp, setModalWhatsApp] = useState(false);
  const [whatsappTab, setWhatsappTab] = useState('text'); // 'text', 'image-url', 'image-upload'
  const [numeroDestino, setNumeroDestino] = useState('');
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [imagenUrl, setImagenUrl] = useState('');
  const [captionTexto, setCaptionTexto] = useState('');
  const [archivoImagen, setArchivoImagen] = useState(null);
  const [enviandoMensaje, setEnviandoMensaje] = useState(false);
  const [resultadoEnvio, setResultadoEnvio] = useState(null);
  
  // Estados para el modal de subida de factura
  const [modalFactura, setModalFactura] = useState(false);
  const [billingSeleccionado, setBillingSeleccionado] = useState(null);
  const [archivoFactura, setArchivoFactura] = useState(null);
  const [subiendoFactura, setSubiendoFactura] = useState(false);
  
  // Estados para el modal de mensajes WhatsApp
  const [modalMensajesWA, setModalMensajesWA] = useState(false);
  const [mensajesWhatsApp, setMensajesWhatsApp] = useState(null);
  const [cargandoMensajes, setCargandoMensajes] = useState(false);
  const [paginaMensajes, setPaginaMensajes] = useState(1);
  const [mesMensajes, setMesMensajes] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    if (!loading) setRefreshing(true);
    setLoading(true);
    setError(null);

    try {
      // Cargar información del bot
      const response = await botService.obtenerTodos();
      const botEncontrado = response.data.find(b => b._id === id);
      
      if (!botEncontrado) {
        setError('Bot no encontrado');
        setLoading(false);
        setRefreshing(false);
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
      const [healthRes, summaryRes, usageRes, billingRes] = await Promise.allSettled([
        botApi.get('/api/health'),
        botApi.get('/api/stats/summary'),
        botApi.get('/api/stats/usage'),
        botApi.get('/api/stats/billing')
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

      if (billingRes.status === 'fulfilled') {
        setBilling(billingRes.value.data);
      }

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar información del bot');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
      limpiarFormulariosWhatsApp();
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

  const enviarImagenUrl = async (e) => {
    e.preventDefault();
    setEnviandoMensaje(true);
    setResultadoEnvio(null);

    try {
      const response = await axios.post(
        `${bot.url}/api/whatsapp/send-image`,
        {
          to: numeroDestino,
          image: imagenUrl,
          caption: captionTexto || undefined
        },
        {
          headers: {
            'accept': '*/*',
            'x-api-key': bot.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      const fechaEnvio = new Date(response.data.data.sentAt);
      const horaEnvio = fechaEnvio.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      toast.success(
        `✓ Imagen enviada a +${response.data.data.to} a las ${horaEnvio}`,
        {
          autoClose: 4000,
          style: {
            fontSize: '0.95rem'
          }
        }
      );
      
      limpiarFormulariosWhatsApp();
      setTimeout(() => {
        cerrarModalWhatsApp();
      }, 1500);
    } catch (error) {
      console.error('Error al enviar imagen:', error);
      const errorMsg = error.response?.data?.message || 'Error al enviar la imagen';
      toast.error(errorMsg);
      setResultadoEnvio(null);
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const enviarImagenUpload = async (e) => {
    e.preventDefault();
    if (!archivoImagen) {
      toast.error('Por favor selecciona una imagen');
      return;
    }

    setEnviandoMensaje(true);
    setResultadoEnvio(null);

    try {
      const formData = new FormData();
      formData.append('to', numeroDestino);
      formData.append('image', archivoImagen);
      if (captionTexto) {
        formData.append('caption', captionTexto);
      }

      const response = await axios.post(
        `${bot.url}/api/whatsapp/send-image-upload`,
        formData,
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': bot.apiKey,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const fechaEnvio = new Date(response.data.data.sentAt);
      const horaEnvio = fechaEnvio.toLocaleTimeString('es-PE', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });

      toast.success(
        `✓ Imagen enviada a +${response.data.data.to} a las ${horaEnvio}`,
        {
          autoClose: 4000,
          style: {
            fontSize: '0.95rem'
          }
        }
      );
      
      limpiarFormulariosWhatsApp();
      setTimeout(() => {
        cerrarModalWhatsApp();
      }, 1500);
    } catch (error) {
      console.error('Error al enviar imagen:', error);
      const errorMsg = error.response?.data?.message || 'Error al enviar la imagen';
      toast.error(errorMsg);
      setResultadoEnvio(null);
    } finally {
      setEnviandoMensaje(false);
    }
  };

  const abrirModalWhatsApp = () => {
    setModalWhatsApp(true);
    setWhatsappTab('text');
    setResultadoEnvio(null);
  };

  const cerrarModalWhatsApp = () => {
    setModalWhatsApp(false);
    limpiarFormulariosWhatsApp();
    setResultadoEnvio(null);
  };

  const limpiarFormulariosWhatsApp = () => {
    setNumeroDestino('');
    setMensajeTexto('');
    setImagenUrl('');
    setCaptionTexto('');
    setArchivoImagen(null);
  };

  const handleArchivoImagenChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setArchivoImagen(file);
    } else {
      toast.error('Por favor selecciona un archivo de imagen válido');
      e.target.value = null;
    }
  };

  const copiarCurlText = () => {
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

  const copiarCurlImageUrl = () => {
    const curlCommand = `curl -X 'POST' \\
  '${bot.url}/api/whatsapp/send-image' \\
  -H 'accept: */*' \\
  -H 'x-api-key: ${bot.apiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "to": "955768897",
  "image": "https://example.com/image.jpg",
  "caption": "Esta es una imagen de ejemplo"
}'`;
    navigator.clipboard.writeText(curlCommand);
    toast.success('Comando curl copiado al portapapeles');
  };

  const copiarCurlImageUpload = () => {
    const curlCommand = `curl -X 'POST' \\
  '${bot.url}/api/whatsapp/send-image-upload' \\
  -H 'accept: application/json' \\
  -H 'x-api-key: ${bot.apiKey}' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'to=955768897' \\
  -F 'image=@/path/to/image.jpg;type=image/jpeg' \\
  -F 'caption=Esta es una imagen de ejemplo'`;
    navigator.clipboard.writeText(curlCommand);
    toast.success('Comando curl copiado al portapapeles');
  };

  const abrirModalFactura = (billingRecord) => {
    setBillingSeleccionado(billingRecord);
    setModalFactura(true);
  };

  const cerrarModalFactura = () => {
    setModalFactura(false);
    setBillingSeleccionado(null);
    setArchivoFactura(null);
  };

  const handleArchivoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setArchivoFactura(file);
    } else {
      toast.error('Por favor selecciona un archivo PDF válido');
    }
  };

  const convertirPDFaBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remover el prefijo 'data:application/pdf;base64,'
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const subirFactura = async (e) => {
    e.preventDefault();
    if (!archivoFactura) {
      toast.error('Por favor selecciona un archivo PDF');
      return;
    }

    setSubiendoFactura(true);

    try {
      const base64 = await convertirPDFaBase64(archivoFactura);
      
      const response = await axios.post(
        `${bot.url}/api/stats/invoice/upload`,
        {
          billingId: billingSeleccionado._id,
          base64: base64,
          filename: archivoFactura.name
        },
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': bot.apiKey,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success(
        `Factura subida exitosamente para ${billingSeleccionado.month}`,
        { autoClose: 3000 }
      );
      
      // Recargar los datos de facturación
      await cargarDatos();
      
      // Cerrar modal
      setTimeout(() => {
        cerrarModalFactura();
      }, 1000);
    } catch (error) {
      console.error('Error al subir factura:', error);
      const errorMsg = error.response?.data?.message || 'Error al subir la factura';
      toast.error(errorMsg);
    } finally {
      setSubiendoFactura(false);
    }
  };

  const restaurarServicio = async () => {
    if (!window.confirm('¿Estás seguro de que deseas restaurar el servicio? Asegúrate de que el pago haya sido realizado.')) {
      return;
    }

    try {
      await axios.post(
        `${bot.url}/api/stats/restore-service`,
        {},
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': bot.apiKey
          }
        }
      );

      toast.success('Servicio restaurado exitosamente');
      
      // Recargar los datos para actualizar el estado
      await cargarDatos();
    } catch (error) {
      console.error('Error al restaurar servicio:', error);
      const errorMsg = error.response?.data?.message || 'Error al restaurar el servicio';
      toast.error(errorMsg);
    }
  };

  const descargarFactura = async (billingRecord) => {
    try {
      const response = await axios.get(
        `${bot.url}/api/stats/invoice/file/${billingRecord._id}`,
        {
          headers: {
            'accept': 'application/pdf',
            'x-api-key': bot.apiKey
          },
          responseType: 'blob' // Importante para recibir el PDF como blob
        }
      );

      // Crear un objeto URL del blob
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Abrir en nueva pestaña para previsualizar
      window.open(url, '_blank');
      
      // Liberar el objeto URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

    } catch (error) {
      console.error('Error al descargar factura:', error);
      const errorMsg = error.response?.data?.message || 'Error al descargar la factura';
      toast.error(errorMsg);
    }
  };

  const eliminarFactura = async (billingRecord) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar la factura del mes ${billingRecord.month}?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmacion) return;

    try {
      await axios.delete(
        `${bot.url}/api/stats/invoice/file/${billingRecord._id}`,
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': bot.apiKey
          }
        }
      );

      toast.success(
        `Factura eliminada exitosamente para ${billingRecord.month}`,
        { autoClose: 3000 }
      );
      
      // Recargar los datos de facturación
      await cargarDatos();
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      const errorMsg = error.response?.data?.message || 'Error al eliminar la factura';
      toast.error(errorMsg);
    }
  };

  const cargarMensajesWhatsApp = async (month = '', page = 1) => {
    setCargandoMensajes(true);
    try {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      params.append('limit', '50');
      params.append('page', page.toString());

      const response = await axios.get(
        `${bot.url}/api/stats/whatsapp?${params.toString()}`,
        {
          headers: {
            'accept': 'application/json',
            'x-api-key': bot.apiKey
          }
        }
      );

      setMensajesWhatsApp(response.data.data);
      setPaginaMensajes(page);
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      const errorMsg = error.response?.data?.message || 'Error al cargar los mensajes';
      toast.error(errorMsg);
    } finally {
      setCargandoMensajes(false);
    }
  };

  const abrirModalMensajesWA = () => {
    // Obtener el mes actual en formato YYYY-MM
    const now = new Date();
    const mesActual = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMesMensajes(mesActual);
    setModalMensajesWA(true);
    cargarMensajesWhatsApp(mesActual, 1);
  };

  const cerrarModalMensajesWA = () => {
    setModalMensajesWA(false);
    setMensajesWhatsApp(null);
    setPaginaMensajes(1);
    setMesMensajes('');
  };

  const cambiarPaginaMensajes = (nuevaPagina) => {
    cargarMensajesWhatsApp(mesMensajes, nuevaPagina);
  };



  if (loading && !bot) {
    return (
      <Layout>
        <div className="detalle-bot-container">
          <SkeletonLoader type="card" count={4} />
        </div>
      </Layout>
    );
  }

  if (error || !bot) {
    return (
      <Layout>
        <div className="error-container">
          <XCircle size={48} />
          <p className="error-message">{error || 'Bot no encontrado'}</p>
          <button onClick={() => navigate('/bots')} className="btn btn-primary">
            <ArrowLeft size={18} /> Volver a Bots
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="detalle-bot-container">
        {/* Header Moderno */}
        <div className="detalle-header-modern">
          <div className="header-top">
            <button onClick={() => navigate('/bots')} className="btn-back">
              <ArrowLeft size={20} />
            </button>
            
            <div className="bot-title-section">
              <h1>{bot.nombre}</h1>
              <span className={`status-badge status-${bot.estado}`}>
                <Activity size={14} />
                {bot.estado === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="header-actions">
              <button 
                onClick={cargarDatos}
                className="btn-icon-action"
                disabled={refreshing}
                title="Refrescar datos"
              >
                <RefreshCw size={18} className={refreshing ? 'spinning' : ''} />
              </button>
              <button 
                onClick={() => window.open(`${bot.url}/api-docs`, '_blank')} 
                className="btn-action btn-swagger"
              >
                <ExternalLink size={18} />
                <span>API Docs</span>
              </button>
              <button 
                onClick={abrirModalWhatsApp}
                className="btn-action btn-test"
              >
                <Send size={18} />
                <span>Probar Envío</span>
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="quick-stats">
            {health && (
              <>
                <div className="quick-stat">
                  <div className={`stat-icon ${health.checks?.api === 'ok' ? 'success' : 'danger'}`}>
                    {health.checks?.api === 'ok' ? <CheckCircle size={20} /> : <XCircle size={20} />}
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">API</span>
                    <span className="stat-value">{health.checks?.api || 'N/A'}</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className={`stat-icon ${health.checks?.database === 'ok' ? 'success' : 'danger'}`}>
                    <Database size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Database</span>
                    <span className="stat-value">{health.checks?.database || 'N/A'}</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className={`stat-icon ${health.checks?.whatsapp === 'connected' ? 'success' : 'danger'}`}>
                    <MessageSquare size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">WhatsApp</span>
                    <span className="stat-value">{health.checks?.whatsapp || 'N/A'}</span>
                  </div>
                </div>
                <div className="quick-stat">
                  <div className={`stat-icon ${health.checks?.email === 'ok' ? 'success' : 'danger'}`}>
                    <Mail size={20} />
                  </div>
                  <div className="stat-info">
                    <span className="stat-label">Email</span>
                    <span className="stat-value">{health.checks?.email || 'N/A'}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tabs de Navegación */}
        <div className="tabs-navigation">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            <BarChart3 size={18} />
            <span>Vista General</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'usage' ? 'active' : ''}`}
            onClick={() => setActiveTab('usage')}
          >
            <TrendingUp size={18} />
            <span>Uso Actual</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'billing' ? 'active' : ''}`}
            onClick={() => setActiveTab('billing')}
          >
            <CreditCard size={18} />
            <span>Facturación</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'api' ? 'active' : ''}`}
            onClick={() => setActiveTab('api')}
          >
            <Key size={18} />
            <span>API & Docs</span>
          </button>
        </div>

        {/* Contenido de los Tabs */}
        <div className="tab-content">
          
          {/* TAB: VISTA GENERAL */}
          {activeTab === 'overview' && (
            <div className="tab-panel fade-in">
              {/* Account Status Alert */}
              {summary?.data?.account && (
                <div className={`account-alert ${summary.data.account.blocked ? 'blocked' : 'active'}`}>
                  <div className="alert-icon">
                    {summary.data.account.blocked ? <XCircle size={24} /> : <CheckCircle size={24} />}
                  </div>
                  <div className="alert-content">
                    <h3>{summary.data.account.blocked ? 'Servicio Bloqueado' : 'Servicio Operativo'}</h3>
                    <p>
                      {summary.data.account.blocked 
                        ? summary.data.account.blockedReason || 'El servicio ha sido suspendido'
                        : 'Todos los sistemas funcionando correctamente'}
                    </p>
                    {summary.data.account.blocked && (
                      <button 
                        className="btn-restore"
                        onClick={restaurarServicio}
                      >
                        <Zap size={18} />
                        Restaurar Servicio
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Metrics Grid */}
              <div className="metrics-grid">
                <div className="metric-card whatsapp" onClick={abrirModalMensajesWA} style={{ cursor: 'pointer' }} title="Ver detalles de mensajes">
                  <div className="metric-header">
                    <MessageSquare size={24} />
                    <h3>WhatsApp</h3>
                  </div>
                  {usage?.data && (
                    <>
                      <div className="metric-value">
                        <span className="big-number">{usage.data.whatsapp?.sent || 0}</span>
                        <span className="metric-label">/ {usage.data.whatsapp?.limit || 0} mensajes</span>
                      </div>
                      <div className="metric-stats">
                        <div className="stat-item">
                          <span className="stat-label">Restantes</span>
                          <span className="stat-number success">{usage.data.whatsapp?.remaining || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Extras</span>
                          <span className="stat-number warning">{usage.data.whatsapp?.extra || 0}</span>
                        </div>
                      </div>
                      <div className="progress-bar-modern">
                        <div 
                          className="progress-fill whatsapp-fill"
                          style={{ 
                            width: `${Math.min(((usage.data.whatsapp?.sent || 0) / (usage.data.whatsapp?.limit || 1)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>

                <div className="metric-card email">
                  <div className="metric-header">
                    <Mail size={24} />
                    <h3>Email</h3>
                  </div>
                  {usage?.data && (
                    <>
                      <div className="metric-value">
                        <span className="big-number">{usage.data.email?.sent || 0}</span>
                        <span className="metric-label">/ {usage.data.email?.limit || 0} correos</span>
                      </div>
                      <div className="metric-stats">
                        <div className="stat-item">
                          <span className="stat-label">Restantes</span>
                          <span className="stat-number success">{usage.data.email?.remaining || 0}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label">Extras</span>
                          <span className="stat-number warning">{usage.data.email?.extra || 0}</span>
                        </div>
                      </div>
                      <div className="progress-bar-modern">
                        <div 
                          className="progress-fill email-fill"
                          style={{ 
                            width: `${Math.min(((usage.data.email?.sent || 0) / (usage.data.email?.limit || 1)) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Current Period Info */}
              {usage?.data && (
                <div className="period-card">
                  <div className="period-header">
                    <Calendar size={20} />
                    <h3>Período Actual</h3>
                  </div>
                  <div className="period-info">
                    <div className="period-month">{usage.data.month}</div>
                    {summary?.data?.lastBilling && (
                      <div className="period-cost">
                        <span>Última facturación:</span>
                        <strong>S/ {summary.data.lastBilling.totalCost?.toFixed(2) || '0.00'}</strong>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB: USO ACTUAL */}
          {activeTab === 'usage' && (
            <div className="tab-panel fade-in">
              {usage?.data ? (
                <>
                  <div className="usage-header-section">
                    <div className="period-badge">
                      <Calendar size={18} />
                      <span>{usage.data.month}</span>
                    </div>
                  </div>

                  <div className="usage-cards-grid">
                    <div className="usage-detail-card">
                      <div className="usage-card-header whatsapp-gradient">
                        <MessageSquare size={32} />
                        <h3>WhatsApp</h3>
                      </div>
                      <div className="usage-card-body">
                        <div className="usage-stat-row">
                          <span>Enviados</span>
                          <strong>{usage.data.whatsapp?.sent || 0}</strong>
                        </div>
                        <div className="usage-stat-row">
                          <span>Límite del plan</span>
                          <strong>{usage.data.whatsapp?.limit || 0}</strong>
                        </div>
                        <div className="usage-stat-row highlight">
                          <span>Disponibles</span>
                          <strong className="success-text">{usage.data.whatsapp?.remaining || 0}</strong>
                        </div>
                        <div className="usage-stat-row">
                          <span>Mensajes extra</span>
                          <strong className="warning-text">{usage.data.whatsapp?.extra || 0}</strong>
                        </div>
                        <div className="usage-progress">
                          <div className="progress-info">
                            <span>Uso del plan</span>
                            <span>{Math.round(((usage.data.whatsapp?.sent || 0) / (usage.data.whatsapp?.limit || 1)) * 100)}%</span>
                          </div>
                          <div className="progress-bar-large">
                            <div 
                              className="progress-fill-large whatsapp-fill"
                              style={{ 
                                width: `${Math.min(((usage.data.whatsapp?.sent || 0) / (usage.data.whatsapp?.limit || 1)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="usage-detail-card">
                      <div className="usage-card-header email-gradient">
                        <Mail size={32} />
                        <h3>Email</h3>
                      </div>
                      <div className="usage-card-body">
                        <div className="usage-stat-row">
                          <span>Enviados</span>
                          <strong>{usage.data.email?.sent || 0}</strong>
                        </div>
                        <div className="usage-stat-row">
                          <span>Límite del plan</span>
                          <strong>{usage.data.email?.limit || 0}</strong>
                        </div>
                        <div className="usage-stat-row highlight">
                          <span>Disponibles</span>
                          <strong className="success-text">{usage.data.email?.remaining || 0}</strong>
                        </div>
                        <div className="usage-stat-row">
                          <span>Correos extra</span>
                          <strong className="warning-text">{usage.data.email?.extra || 0}</strong>
                        </div>
                        <div className="usage-progress">
                          <div className="progress-info">
                            <span>Uso del plan</span>
                            <span>{Math.round(((usage.data.email?.sent || 0) / (usage.data.email?.limit || 1)) * 100)}%</span>
                          </div>
                          <div className="progress-bar-large">
                            <div 
                              className="progress-fill-large email-fill"
                              style={{ 
                                width: `${Math.min(((usage.data.email?.sent || 0) / (usage.data.email?.limit || 1)) * 100, 100)}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="empty-state">
                  <TrendingUp size={48} />
                  <p>No hay datos de uso disponibles</p>
                </div>
              )}
            </div>
          )}
          {/* TAB: FACTURACIÓN */}
          {activeTab === 'billing' && (
            <div className="tab-panel fade-in">
              {billing && billing.data && billing.data.length > 0 ? (
                <div className="billing-modern-container">
                  <div className="billing-table-wrapper">
                    <table className="billing-table-modern">
                      <thead>
                        <tr>
                          <th>Período</th>
                          <th>WhatsApp</th>
                          <th>Email</th>
                          <th>Plan Base</th>
                          <th>Extras</th>
                          <th className="total-column">Total</th>
                          <th>Estado</th>
                          <th>Factura</th>
                          <th className="actions-column">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billing.data.map((record) => (
                          <tr key={record._id} className="billing-row">
                            <td className="period-cell">
                              <Calendar size={14} />
                              <span>{record.month}</span>
                            </td>
                            <td>
                              <div className="usage-cell">
                                <span className="usage-number">{record.whatsappMessagesSent}</span>
                                {record.whatsappExtraMessages > 0 && (
                                  <span className="usage-extra">+{record.whatsappExtraMessages}</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="usage-cell">
                                <span className="usage-number">{record.emailsSent}</span>
                                {record.emailsExtra > 0 && (
                                  <span className="usage-extra">+{record.emailsExtra}</span>
                                )}
                              </div>
                            </td>
                            <td className="cost-cell">S/ {record.basePlanCost.toFixed(2)}</td>
                            <td className="cost-cell">
                              {(record.extraWhatsappCost + record.extraEmailCost) > 0 
                                ? `S/ ${(record.extraWhatsappCost + record.extraEmailCost).toFixed(2)}`
                                : '-'
                              }
                            </td>
                            <td className="total-cell">
                              <strong>S/ {record.totalCost.toFixed(2)}</strong>
                            </td>
                            <td>
                              <span className={`badge-status status-${record.status}`}>
                                {record.status === 'invoiced' ? 'Facturado' : 
                                 record.status === 'paid' ? 'Pagado' : 
                                 record.status === 'pending' ? 'Pendiente' : record.status}
                              </span>
                            </td>
                            <td className="invoice-indicators">
                              {record.invoiceGenerated && (
                                <div className="indicator generated" title="Generada">
                                  <CheckCircle size={14} />
                                </div>
                              )}
                              {record.invoiceUploaded && (
                                <div className="indicator uploaded" title="Subida">
                                  <FileText size={14} />
                                </div>
                              )}
                              {record.paymentReceived && (
                                <div className="indicator paid" title="Pagada">
                                  <CheckCircle size={14} />
                                </div>
                              )}
                            </td>
                            <td className="actions-cell">
                              {!record.invoiceUploaded ? (
                                <button
                                  onClick={() => abrirModalFactura(record)}
                                  className="btn-action-table upload"
                                >
                                  <FileText size={14} />
                                  Subir
                                </button>
                              ) : (
                                <div className="action-buttons-group">
                                  <button
                                    onClick={() => descargarFactura(record)}
                                    className="btn-action-table view"
                                    title="Ver/Descargar"
                                  >
                                    <FileText size={14} />
                                  </button>
                                  <button
                                    onClick={() => eliminarFactura(record)}
                                    className="btn-action-table delete"
                                    title="Eliminar"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="empty-state">
                  <CreditCard size={48} />
                  <p>No hay historial de facturación disponible</p>
                </div>
              )}
            </div>
          )}

          {/* TAB: API & DOCUMENTACIÓN */}
          {activeTab === 'api' && (
            <div className="tab-panel fade-in">
              {/* API Key Section */}
              <div className="api-key-card-modern">
                <div className="api-key-header">
                  <div className="header-left">
                    <Key size={24} />
                    <div>
                      <h3>API Key</h3>
                      <p>Usa esta clave para autenticar tus solicitudes</p>
                    </div>
                  </div>
                  <div className="header-actions">
                    <button 
                      onClick={() => setMostrarApiKey(!mostrarApiKey)}
                      className="btn-icon-modern"
                      title={mostrarApiKey ? 'Ocultar' : 'Mostrar'}
                    >
                      {mostrarApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                    <button 
                      onClick={copiarApiKey}
                      className="btn-icon-modern"
                      title="Copiar"
                    >
                      <Copy size={18} />
                    </button>
                  </div>
                </div>
                <div className="api-key-display-modern">
                  <code>{mostrarApiKey ? bot.apiKey : '•'.repeat(bot.apiKey.length)}</code>
                </div>
              </div>

              {/* cURL Examples */}
              <div className="curl-examples-card">
                <div className="curl-card-header">
                  <Code size={20} />
                  <h3>Ejemplos de Uso</h3>
                </div>

                <div className="example-section">
                  <h4>
                    <MessageSquare size={18} />
                    Enviar WhatsApp
                  </h4>
                  <div className="code-block-header">
                    <span>POST {bot.url}/api/whatsapp/send</span>
                    <button onClick={copiarCurlText} className="btn-copy-code">
                      <Copy size={14} />
                      Copiar
                    </button>
                  </div>
                  <pre className="code-block">
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
                </div>

                <div className="api-info-grid">
                  <div className="info-card">
                    <h5>Headers Requeridos</h5>
                    <ul>
                      <li><code>x-api-key</code>: Tu API Key</li>
                      <li><code>Content-Type</code>: application/json</li>
                      <li><code>accept</code>: */*</li>
                    </ul>
                  </div>
                  <div className="info-card">
                    <h5>Parámetros del Body</h5>
                    <ul>
                      <li><code>to</code>: Número sin código de país</li>
                      <li><code>message</code>: Texto del mensaje</li>
                    </ul>
                  </div>
                </div>

                <div className="test-section">
                  <h4>Probar Envío</h4>
                  <p>Prueba tu configuración enviando un mensaje de prueba directamente desde aquí</p>
                  <button 
                    onClick={abrirModalWhatsApp}
                    className="btn-test-large"
                  >
                    <Send size={18} />
                    Abrir Formulario de Prueba
                  </button>
                </div>
              </div>

              {/* External Links */}
              <div className="docs-links-card">
                <h3>
                  <FileCode2 size={20} />
                  Documentación y Recursos
                </h3>
                <div className="links-grid">
                  <a 
                    href={`${bot.url}/api-docs`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="doc-link swagger"
                  >
                    <div className="link-icon">
                      <ExternalLink size={20} />
                    </div>
                    <div className="link-content">
                      <h4>Swagger UI</h4>
                      <p>Documentación interactiva de la API</p>
                    </div>
                  </a>
                  <a 
                    href={`${bot.url}/api/health`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="doc-link health"
                  >
                    <div className="link-icon">
                      <Activity size={20} />
                    </div>
                    <div className="link-content">
                      <h4>Health Check</h4>
                      <p>Estado en tiempo real de los servicios</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Prueba WhatsApp */}
      <Modal
        isOpen={modalWhatsApp}
        onClose={cerrarModalWhatsApp}
        title="Probar Envío WhatsApp"
        size="large"
      >
        <div className="whatsapp-test-modal">
          {/* Tabs Navigation */}
          <div className="tabs-navigation-modal">
            <button 
              className={`tab-btn-modal ${whatsappTab === 'text' ? 'active' : ''}`}
              onClick={() => setWhatsappTab('text')}
              disabled={enviandoMensaje}
            >
              <MessageSquare size={16} />
              <span>Texto</span>
            </button>
            <button 
              className={`tab-btn-modal ${whatsappTab === 'image-url' ? 'active' : ''}`}
              onClick={() => setWhatsappTab('image-url')}
              disabled={enviandoMensaje}
            >
              <ExternalLink size={16} />
              <span>Imagen (URL)</span>
            </button>
            <button 
              className={`tab-btn-modal ${whatsappTab === 'image-upload' ? 'active' : ''}`}
              onClick={() => setWhatsappTab('image-upload')}
              disabled={enviandoMensaje}
            >
              <FileText size={16} />
              <span>Imagen (Upload)</span>
            </button>
          </div>

          {/* Tab Content: Texto */}
          {whatsappTab === 'text' && (
            <div className="tab-panel-modal fade-in">
              {/* cURL Section */}
              <div className="curl-section-modal">
                <div className="curl-header-modal">
                  <h4>
                    <Code size={18} />
                    Ejemplo con cURL
                  </h4>
                  <button 
                    type="button"
                    onClick={copiarCurlText}
                    className="btn-icon-modal"
                    title="Copiar cURL"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <pre className="curl-code-modal">
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
              </div>

              <div className="form-divider-modal">
                <span>Prueba directa</span>
              </div>

              {/* Form */}
              <form onSubmit={enviarMensajeWhatsApp} className="whatsapp-form-modal">
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
            </div>
          )}

          {/* Tab Content: Imagen (URL) */}
          {whatsappTab === 'image-url' && (
            <div className="tab-panel-modal fade-in">
              {/* cURL Section */}
              <div className="curl-section-modal">
                <div className="curl-header-modal">
                  <h4>
                    <Code size={18} />
                    Ejemplo con cURL
                  </h4>
                  <button 
                    type="button"
                    onClick={copiarCurlImageUrl}
                    className="btn-icon-modal"
                    title="Copiar cURL"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <pre className="curl-code-modal">
{`curl -X 'POST' \\
  '${bot.url}/api/whatsapp/send-image' \\
  -H 'accept: */*' \\
  -H 'x-api-key: ${bot.apiKey}' \\
  -H 'Content-Type: application/json' \\
  -d '{
  "to": "955768897",
  "image": "https://example.com/image.jpg",
  "caption": "Esta es una imagen de ejemplo"
}'`}
                </pre>
              </div>

              <div className="form-divider-modal">
                <span>Prueba directa</span>
              </div>

              {/* Form */}
              <form onSubmit={enviarImagenUrl} className="whatsapp-form-modal">
                <div className="form-group">
                  <label htmlFor="numeroDestinoImg">
                    Número de Destino <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="numeroDestinoImg"
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
                  <label htmlFor="imagenUrl">
                    URL de la Imagen <span className="required">*</span>
                  </label>
                  <input
                    type="url"
                    id="imagenUrl"
                    value={imagenUrl}
                    onChange={(e) => setImagenUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    required
                    disabled={enviandoMensaje}
                    className="form-input"
                  />
                  <small className="form-hint">URL pública de la imagen</small>
                </div>

                <div className="form-group">
                  <label htmlFor="captionUrl">
                    Caption (Opcional)
                  </label>
                  <textarea
                    id="captionUrl"
                    value={captionTexto}
                    onChange={(e) => setCaptionTexto(e.target.value)}
                    placeholder="Texto que acompaña la imagen..."
                    rows="3"
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
                        <Send size={18} /> Enviar Imagen
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Tab Content: Imagen (Upload) */}
          {whatsappTab === 'image-upload' && (
            <div className="tab-panel-modal fade-in">
              {/* cURL Section */}
              <div className="curl-section-modal">
                <div className="curl-header-modal">
                  <h4>
                    <Code size={18} />
                    Ejemplo con cURL
                  </h4>
                  <button 
                    type="button"
                    onClick={copiarCurlImageUpload}
                    className="btn-icon-modal"
                    title="Copiar cURL"
                  >
                    <Copy size={16} />
                  </button>
                </div>
                <pre className="curl-code-modal">
{`curl -X 'POST' \\
  '${bot.url}/api/whatsapp/send-image-upload' \\
  -H 'accept: application/json' \\
  -H 'x-api-key: ${bot.apiKey}' \\
  -H 'Content-Type: multipart/form-data' \\
  -F 'to=955768897' \\
  -F 'image=@/path/to/image.jpg;type=image/jpeg' \\
  -F 'caption=Esta es una imagen de ejemplo'`}
                </pre>
              </div>

              <div className="form-divider-modal">
                <span>Prueba directa</span>
              </div>

              {/* Form */}
              <form onSubmit={enviarImagenUpload} className="whatsapp-form-modal">
                <div className="form-group">
                  <label htmlFor="numeroDestinoUpload">
                    Número de Destino <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="numeroDestinoUpload"
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
                  <label htmlFor="archivoImagen">
                    Seleccionar Imagen <span className="required">*</span>
                  </label>
                  <input
                    type="file"
                    id="archivoImagen"
                    accept="image/*"
                    onChange={handleArchivoImagenChange}
                    required
                    disabled={enviandoMensaje}
                    className="form-input-file"
                  />
                  {archivoImagen && (
                    <small className="file-name-selected">
                      Archivo: {archivoImagen.name} ({(archivoImagen.size / 1024).toFixed(2)} KB)
                    </small>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="captionUpload">
                    Caption (Opcional)
                  </label>
                  <textarea
                    id="captionUpload"
                    value={captionTexto}
                    onChange={(e) => setCaptionTexto(e.target.value)}
                    placeholder="Texto que acompaña la imagen..."
                    rows="3"
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
                    disabled={enviandoMensaje || !archivoImagen}
                  >
                    {enviandoMensaje ? (
                      <>
                        <span className="spinner-small"></span> Enviando...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Enviar Imagen
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Subida de Factura */}
      <Modal
        isOpen={modalFactura}
        onClose={cerrarModalFactura}
        title={`Subir Factura - ${billingSeleccionado?.month || ''}`}
        size="medium"
      >
        <form onSubmit={subirFactura} className="upload-form">
          <div className="upload-info">
            <p><strong>Mes:</strong> {billingSeleccionado?.month}</p>
            <p><strong>Total:</strong> S/ {billingSeleccionado?.totalCost?.toFixed(2)}</p>
            <p><strong>Estado:</strong> {billingSeleccionado?.status}</p>
          </div>

          <div className="form-group">
            <label htmlFor="pdfFile">
              Selecciona el archivo PDF de la factura <span className="required">*</span>
            </label>
            <input
              type="file"
              id="pdfFile"
              accept="application/pdf"
              onChange={handleArchivoChange}
              required
              disabled={subiendoFactura}
              className="form-input-file"
            />
            {archivoFactura && (
              <small className="file-name">
                Archivo seleccionado: {archivoFactura.name}
              </small>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={cerrarModalFactura}
              className="btn btn-secondary"
              disabled={subiendoFactura}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={subiendoFactura || !archivoFactura}
            >
              {subiendoFactura ? (
                <>
                  <span className="spinner-small"></span> Subiendo...
                </>
              ) : (
                'Subir Factura'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal de Mensajes WhatsApp */}
      <Modal
        isOpen={modalMensajesWA}
        onClose={cerrarModalMensajesWA}
        title="Detalle de Mensajes WhatsApp"
        size="large"
      >
        <div className="mensajes-whatsapp-modal">
          {/* Filtro de mes */}
          <div className="filter-section">
            <label htmlFor="filtroMes">Filtrar por mes:</label>
            <input
              type="month"
              id="filtroMes"
              value={mesMensajes}
              onChange={(e) => {
                setMesMensajes(e.target.value);
                cargarMensajesWhatsApp(e.target.value, 1);
              }}
              disabled={cargandoMensajes}
              className="form-input"
            />
          </div>

          {cargandoMensajes ? (
            <div className="loading-container">
              <span className="spinner-small"></span>
              <p>Cargando mensajes...</p>
            </div>
          ) : mensajesWhatsApp ? (
            <>
              {/* Estadísticas */}
              {mensajesWhatsApp.stats && (
                <div className="stats-grid-modal">
                  <div className="stat-card-modal success">
                    <CheckCircle size={20} />
                    <div>
                      <span className="stat-label">Enviados</span>
                      <strong>{mensajesWhatsApp.stats.totalSent}</strong>
                    </div>
                  </div>
                  <div className="stat-card-modal danger">
                    <XCircle size={20} />
                    <div>
                      <span className="stat-label">Fallidos</span>
                      <strong>{mensajesWhatsApp.stats.totalFailed}</strong>
                    </div>
                  </div>
                  <div className="stat-card-modal warning">
                    <Activity size={20} />
                    <div>
                      <span className="stat-label">Pendientes</span>
                      <strong>{mensajesWhatsApp.stats.totalPending}</strong>
                    </div>
                  </div>
                  <div className="stat-card-modal info">
                    <FileText size={20} />
                    <div>
                      <span className="stat-label">Con Imágenes</span>
                      <strong>{mensajesWhatsApp.stats.totalWithImages}</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabla de mensajes */}
              {mensajesWhatsApp.messages && mensajesWhatsApp.messages.length > 0 ? (
                <div className="messages-table-wrapper">
                  <table className="messages-table">
                    <thead>
                      <tr>
                        <th>Destinatario</th>
                        <th>Mensaje</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                        <th>Media</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mensajesWhatsApp.messages.map((msg) => (
                        <tr key={msg._id}>
                          <td className="phone-cell">{msg.to}</td>
                          <td className="message-cell">
                            <div className="message-preview">
                              {msg.message || <em>Sin texto</em>}
                            </div>
                            {msg.error && (
                              <div className="error-message">
                                <XCircle size={12} />
                                {msg.error}
                              </div>
                            )}
                          </td>
                          <td>
                            <span className={`badge-status status-${msg.status}`}>
                              {msg.status === 'sent' ? 'Enviado' : 
                               msg.status === 'failed' ? 'Fallido' : 
                               msg.status === 'pending' ? 'Pendiente' : msg.status}
                            </span>
                          </td>
                          <td className="date-cell">
                            {msg.sentAt ? new Date(msg.sentAt).toLocaleString('es-PE', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : '-'}
                          </td>
                          <td className="media-cell">
                            {msg.hasMedia ? (
                              <span className="badge-media">
                                <FileText size={12} />
                                Sí
                              </span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">
                  <MessageSquare size={48} />
                  <p>No hay mensajes en este período</p>
                </div>
              )}

              {/* Paginación */}
              {mensajesWhatsApp.pagination && mensajesWhatsApp.pagination.pages > 1 && (
                <div className="pagination-container">
                  <button
                    onClick={() => cambiarPaginaMensajes(paginaMensajes - 1)}
                    disabled={paginaMensajes === 1 || cargandoMensajes}
                    className="btn-pagination"
                  >
                    Anterior
                  </button>
                  <span className="pagination-info">
                    Página {mensajesWhatsApp.pagination.page} de {mensajesWhatsApp.pagination.pages}
                    {' '}({mensajesWhatsApp.pagination.total} mensajes)
                  </span>
                  <button
                    onClick={() => cambiarPaginaMensajes(paginaMensajes + 1)}
                    disabled={paginaMensajes >= mensajesWhatsApp.pagination.pages || cargandoMensajes}
                    className="btn-pagination"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <MessageSquare size={48} />
              <p>No se pudieron cargar los mensajes</p>
            </div>
          )}
        </div>
      </Modal>
    </Layout>
  );
}

export default DetalleBot;
