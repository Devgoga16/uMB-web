import { useState, useEffect } from 'react';
import { Eye, EyeOff, X, AlertCircle } from 'lucide-react';
import userService from '../../services/userService';
import '../../styles/FormularioUsuario.css';

/**
 * Componente de formulario para crear o editar usuarios
 */
function FormularioUsuario({ usuarioEditar, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'usuario',
    activo: true
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (usuarioEditar) {
      setFormData({
        nombre: usuarioEditar.nombre || '',
        email: usuarioEditar.email || '',
        password: '', // No mostramos la contraseña al editar
        rol: usuarioEditar.rol || 'usuario',
        activo: usuarioEditar.activo !== undefined ? usuarioEditar.activo : true
      });
    }
  }, [usuarioEditar]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validarFormulario = () => {
    if (!formData.nombre.trim()) {
      setError('El nombre es requerido');
      return false;
    }

    if (!formData.email.trim()) {
      setError('El email es requerido');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Email inválido');
      return false;
    }

    // Solo validar password si es creación o si se ingresó una nueva
    if (!usuarioEditar && !formData.password) {
      setError('La contraseña es requerida');
      return false;
    }

    if (formData.password && formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
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
      if (usuarioEditar) {
        // Actualizar usuario existente
        const dataActualizar = {
          nombre: formData.nombre,
          email: formData.email,
          rol: formData.rol,
          activo: formData.activo
        };

        // Solo incluir password si se proporcionó uno nuevo
        if (formData.password) {
          dataActualizar.password = formData.password;
        }

        await userService.actualizar(usuarioEditar._id, dataActualizar);
        alert('Usuario actualizado exitosamente');
      } else {
        // Crear nuevo usuario
        await userService.crear(formData);
        alert('Usuario creado exitosamente');
      }

      // Resetear formulario
      setFormData({
        nombre: '',
        email: '',
        password: '',
        rol: 'usuario',
        activo: true
      });

      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error:', error);
      setError(error.mensaje || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="formulario-usuario">
      {error && (
        <div className="alert alert-error">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="nombre">
            Nombre completo <span className="requerido">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ej: Juan Pérez"
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
            placeholder="usuario@example.com"
            disabled={loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">
            Contraseña {usuarioEditar ? '(dejar vacío para no cambiar)' : <span className="requerido">*</span>}
          </label>
          <div className="password-input">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              disabled={loading}
              required={!usuarioEditar}
            />
            <button
              type="button"
              className="btn-toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex="-1"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="rol">
              Rol <span className="requerido">*</span>
            </label>
            <select
              id="rol"
              name="rol"
              value={formData.rol}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="activo"
                checked={formData.activo}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Usuario activo</span>
            </label>
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
            {loading ? 'Guardando...' : usuarioEditar ? 'Actualizar' : 'Crear Usuario'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormularioUsuario;
