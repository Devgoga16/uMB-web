import { useState } from 'react';
import { Plus } from 'lucide-react';
import ListaBots from '../components/bots/ListaBots';
import FormularioBot from '../components/bots/FormularioBot';
import Modal from '../components/Modal';
import Layout from '../components/Layout';
import '../styles/GestionBots.css';

/**
 * Página principal de Gestión de Bots
 */
function GestionBots() {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [botEditar, setBotEditar] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleNuevoBot = () => {
    setBotEditar(null);
    setMostrarModal(true);
  };

  const handleEditarBot = (bot) => {
    setBotEditar(bot);
    setMostrarModal(true);
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setBotEditar(null);
  };

  const handleSuccess = () => {
    setMostrarModal(false);
    setBotEditar(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <Layout>
      <div className="gestion-bots">
          <div className="page-header">
            <div>
              <h1>Gestión de Bots</h1>
              <p className="subtitle">Configura y administra todos tus bots</p>
            </div>
            <button onClick={handleNuevoBot} className="btn btn-primary">
              <Plus size={18} /> Configurar Bot
            </button>
          </div>

          <div className="page-content">
            {/* Lista de bots */}
            <ListaBots 
              onEdit={handleEditarBot}
              onRefresh={refreshKey}
            />
          </div>

          {/* Modal para crear/editar bot */}
          <Modal
            isOpen={mostrarModal}
            onClose={handleCerrarModal}
            title={botEditar ? 'Editar Bot' : 'Configurar Nuevo Bot'}
            size="medium"
          >
            <FormularioBot
              botEditar={botEditar}
              onSuccess={handleSuccess}
              onCancel={handleCerrarModal}
            />
          </Modal>
      </div>
    </Layout>
  );
}

export default GestionBots;
