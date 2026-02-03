import { useState, useEffect } from 'react';
import { X, AlertCircle, RefreshCw } from 'lucide-react';
import botService from '../../services/botService';
import '../../styles/FormularioBot.css';

/**
 * Genera una API Key aleatoria
 */
const generarApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 32;
  let apiKey = 'sk_live_';
  for (let i = 0; i < length; i++) {
    apiKey += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return apiKey;
};

/**
 * Componente de formulario para crear o editar bots
 */
function FormularioBot({ botEditar, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    url: '',
    apiKey: generarApiKey(),
    baseDatos: '',
    email: '',
    password: '',
    plan: {
      tipo: 'standard',
      precio: 0,
      limites: {
        mensajesWhatsApp: 1000,
        correos: 500
      },
      costosExtras: {
        mensajeWhatsApp: 0.05,
        correo: 0.02
      }
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (botEditar) {
      setFormData({
        nombre: botEditar.nombre || '',
        url: botEditar.url || '',
        apiKey: botEditar.apiKey || '',
        baseDatos: botEditar.baseDatos || '',
        email: botEditar.email || '',
        password: botEditar.password || '',
        plan: {
          tipo: botEditar.plan?.tipo || 'standard',
          precio: botEditar.plan?.precio || 0,
          limites: {
            mensajesWhatsApp: botEditar.plan?.limites?.mensajesWhatsApp || 1000,
            correos: botEditar.plan?.limites?.correos || 500
          },
          costosExtras: {
            mensajeWhatsApp: botEditar.plan?.costosExtras?.mensajeWhatsApp || 0.05,
            correo: botEditar.plan?.costosExtras?.correo || 0.02
          }
        }
      });
    }
  }, [botEditar]);

  const handleRegenerarApiKey = () => {
    setFormData(prev => ({
      ...prev,
      apiKey: generarApiKey()
    }));
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Manejar campos anidados (plan.tipo, plan.precio, etc.)
    if (name.includes('.')) {
      const [parent, child, subchild] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: subchild ? {
          ...prev[parent],
          [child]: {
            ...prev[parent][child],
            [subchild]: type === 'number' ? parseFloat(value) || 0 : value
          }
        } : {
          ...prev[parent],
          [child]: type === 'number' ? parseFloat(value) || 0 : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre del bot es requerido');
      return false;
    }

    if (!formData.url.trim()) {
      setError('La URL es requerida');
      return false;
    }

    if (!formData.apiKey.trim()) {
      setError('La API Key es requerida');
      return false;
    }

    if (!formData.baseDatos.trim()) {
      setError('La base de datos es requerida');
      return false;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }

    if (!formData.password.trim()) {
      setError('La contraseña es requerida');
      return false;
    }

    if (formData.plan.precio < 0) {
      setError('El precio no puede ser negativo');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);

    try {
      if (botEditar) {
        await botService.actualizar(botEditar._id, formData);
        alert('Bot actualizado exitosamente');
      } else {
        await botService.crear(formData);
        alert('Bot creado exitosamente');
      }

      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error:', error);
      setError(error.mensaje || 'Error al guardar bot');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-bot">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">
            Nombre del Bot <span className="requerido">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Bot Principal"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="url">
            URL <span className="requerido">*</span>
          </label>
          <input
            type="url"
            id="url"
            name="url"
            value={formData.url}
            onChange={handleChange}
            placeholder="https://bot.miempresa.com"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="baseDatos">
            Base de Datos <span className="requerido">*</span>
          </label>
          <input
            type="text"
            id="baseDatos"
            name="baseDatos"
            value={formData.baseDatos}
            onChange={handleChange}
            placeholder="nombre_base_datos"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">
            Email <span className="requerido">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="bot@empresa.com"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Contraseña <span className="requerido">*</span>
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">
            API Key <span className="requerido">*</span>
          </label>
          <div className="api-key-container">
            <input
              type="text"
              id="apiKey"
              name="apiKey"
              value={formData.apiKey}
              placeholder="sk_live_..."
              readOnly
              className="api-key-input"
            />
            {!botEditar && (
              <button
                type="button"
                onClick={handleRegenerarApiKey}
                className="btn-regenerar"
                title="Regenerar API Key"
                disabled={loading}
              >
                <RefreshCw size={16} />
              </button>
            )}
          </div>
          <small className="form-hint">Esta clave se genera automáticamente y no puede ser modificada</small>
        </div>

        <div className="form-section">
          <h4>Plan Standard</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plan.precio">
                Precio (S/) <span className="requerido">*</span>
              </label>
              <input
                type="number"
                id="plan.precio"
                name="plan.precio"
                value={formData.plan.precio}
                onChange={handleChange}
                placeholder="99.99"
                step="0.01"
                min="0"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plan.limites.mensajesWhatsApp">
                Límite Mensajes WhatsApp
              </label>
              <input
                type="number"
                id="plan.limites.mensajesWhatsApp"
                name="plan.limites.mensajesWhatsApp"
                value={formData.plan.limites.mensajesWhatsApp}
                onChange={handleChange}
                placeholder="5000"
                min="0"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="plan.limites.correos">
                Límite Correos
              </label>
              <input
                type="number"
                id="plan.limites.correos"
                name="plan.limites.correos"
                value={formData.plan.limites.correos}
                onChange={handleChange}
                placeholder="2000"
                min="0"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="plan.costosExtras.mensajeWhatsApp">
                Costo Extra por Mensaje WhatsApp (S/)
              </label>
              <input
                type="number"
                id="plan.costosExtras.mensajeWhatsApp"
                name="plan.costosExtras.mensajeWhatsApp"
                value={formData.plan.costosExtras.mensajeWhatsApp}
                onChange={handleChange}
                placeholder="0.05"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="plan.costosExtras.correo">
                Costo Extra por Correo (S/)
              </label>
              <input
                type="number"
                id="plan.costosExtras.correo"
                name="plan.costosExtras.correo"
                value={formData.plan.costosExtras.correo}
                onChange={handleChange}
                placeholder="0.02"
                step="0.01"
                min="0"
                disabled={loading}
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>
          )}
          
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Guardando...' : botEditar ? 'Actualizar Bot' : 'Crear Bot'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioBot;
