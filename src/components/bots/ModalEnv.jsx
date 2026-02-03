import { X, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import '../../styles/Modal.css';

/**
 * Modal para mostrar y copiar el archivo .env del bot
 */
function ModalEnv({ bot, onClose }) {
  const [copiado, setCopiado] = useState(false);

  const generarEnv = () => {
    return `# Puerto del servidor
PORT=3000

# URL base de la API (para generar links de QR)
API_URL=${bot.url}

# Configuración de MongoDB
MONGODB_URI=${bot.baseDatos}

# API Key para autenticación
API_KEY=${bot.apiKey}

# Configuración de correo para notificaciones
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=${bot.email}
EMAIL_PASSWORD=${bot.password}
EMAIL_FROM=${bot.email}

# Configuración para la forma de administrar
PRICE_PLAN=${bot.plan?.precio || 0}
WHATSAPP_MESSAGE_LIMIT=${bot.plan?.limites?.mensajesWhatsApp || 1000}
EMAIL_LIMIT=${bot.plan?.limites?.correos || 500}
PRICE_WHATSAPP_EXTRA_MESSAGE=${bot.plan?.costosExtras?.mensajeWhatsApp || 0.05}
PRICE_EMAIL_EXTRA=${bot.plan?.costosExtras?.correo || 0.02}`;
  };

  const handleCopiar = async () => {
    try {
      await navigator.clipboard.writeText(generarEnv());
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error('Error al copiar:', error);
      alert('Error al copiar al portapapeles');
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content modal-env">
        <div className="modal-header">
          <h3>Configuración .env - {bot.nombre}</h3>
          <button onClick={onClose} className="btn-cerrar-modal" title="Cerrar">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="env-container">
            <pre className="env-content">{generarEnv()}</pre>
          </div>
          
          <button 
            onClick={handleCopiar} 
            className="btn btn-primary btn-copiar"
          >
            {copiado ? (
              <>
                <Check size={16} /> Copiado
              </>
            ) : (
              <>
                <Copy size={16} /> Copiar al portapapeles
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ModalEnv;
