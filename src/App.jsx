import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/Toast.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import GestionUsuarios from './pages/GestionUsuarios';
import GestionBots from './pages/GestionBots';
import DetalleBot from './pages/DetalleBot';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bots" 
          element={
            <ProtectedRoute>
              <GestionBots />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/bots/:id" 
          element={
            <ProtectedRoute>
              <DetalleBot />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/usuarios" 
          element={
            <ProtectedRoute requireAdmin={true}>
              <GestionUsuarios />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
