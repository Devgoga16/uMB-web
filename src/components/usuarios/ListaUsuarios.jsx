import { useState, useEffect } from 'react';
import { Edit, Lock, Unlock, Trash2 } from 'lucide-react';
import userService from '../../services/userService';
import '../../styles/ListaUsuarios.css';

/**
 * Componente para mostrar la lista de usuarios en tabla
 */
function ListaUsuarios({ onEdit, onRefresh }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarUsuarios();
  }, [onRefresh]);

  const cargarUsuarios = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await userService.obtenerTodos();
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
      setError(error.mensaje || 'Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar al usuario "${nombre}"?`)) {
      return;
    }

    try {
      await userService.eliminar(id);
      alert('Usuario eliminado exitosamente');
      cargarUsuarios();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert(error.mensaje || 'Error al eliminar usuario');
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    try {
      await userService.cambiarEstado(id, !estadoActual);
      alert(`Usuario ${!estadoActual ? 'activado' : 'desactivado'} exitosamente`);
      cargarUsuarios();
    } catch (error) {
      console.error('Error al cambiar estado:', error);
      alert(error.mensaje || 'Error al cambiar estado');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando usuarios...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">❌ {error}</p>
        <button onClick={cargarUsuarios} className="btn-retry">
          Reintentar
        </button>
      </div>
    );
  }

  if (usuarios.length === 0) {
    return (
      <div className="empty-state">
        <p>No hay usuarios registrados</p>
      </div>
    );
  }

  return (
    <div className="lista-usuarios">
      <div className="tabla-header">
        <h3>Total de usuarios: {usuarios.length}</h3>
      </div>
      
      <div className="tabla-container">
        <table className="tabla-usuarios">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario._id} className={!usuario.activo ? 'usuario-inactivo' : ''}>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>
                  <span className={`badge badge-${usuario.rol}`}>
                    {usuario.rol}
                  </span>
                </td>
                <td>
                  <span className={`badge ${usuario.activo ? 'badge-activo' : 'badge-inactivo'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  {new Date(usuario.createdAt).toLocaleDateString('es-ES')}
                </td>
                <td>
                  <div className="acciones">
                    <button
                      onClick={() => onEdit(usuario)}
                      className="btn-icono btn-editar"
                      title="Editar"
                    >
                      <Edit size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleToggleEstado(usuario._id, usuario.activo)}
                      className={`btn-icono ${usuario.activo ? 'btn-desactivar' : 'btn-activar'}`}
                      title={usuario.activo ? 'Desactivar' : 'Activar'}
                    >
                      {usuario.activo ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    
                    <button
                      onClick={() => handleEliminar(usuario._id, usuario.nombre)}
                      className="btn-icono btn-eliminar"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListaUsuarios;
