import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import ListaUsuarios from '../components/usuarios/ListaUsuarios';
import FormularioUsuario from '../components/usuarios/FormularioUsuario';
import Modal from '../components/Modal';
import Layout from '../components/Layout';
import '../styles/GestionUsuarios.css';

/**
 * Página principal de Gestión de Usuarios
 * Solo accesible para administradores
 */
function GestionUsuarios() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNuevoUsuario = () => {
    setUsuarioEditar(null);
    setMostrarModal(true);
  };

  const handleEditarUsuario = (usuario) => {
    setUsuarioEditar(usuario);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setUsuarioEditar(null);
  };

  const handleSuccess = () => {
    setMostrarModal(false);
    setUsuarioEditar(null);
    // Forzar recarga de la lista
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="gestion-usuarios">
        <div className="page-header">
          <div>
            <h1>Gestión de Usuarios</h1>
            <p className="subtitle">Administra todos los usuarios del sistema</p>
          </div>
          <button onClick={handleNuevoUsuario} className="btn btn-primary">
            <UserPlus size={18} /> Nuevo Usuario
          </button>
        </div>

        <div className="page-content">
          {/* Lista de usuarios */}
          <ListaUsuarios 
            onEdit={handleEditarUsuario}
            onRefresh={refreshKey}
          />
        </div>

        {/* Modal para crear/editar usuario */}
        <Modal
          isOpen={mostrarModal}
          onClose={handleCerrarModal}
          title={usuarioEditar ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
          size="medium"
        >
          <FormularioUsuario
            usuarioEditar={usuarioEditar}
            onSuccess={handleSuccess}
            onCancel={handleCerrarModal}
          />
        </Modal>
      </div>
    </Layout>
  );
}

export default GestionUsuarios;
