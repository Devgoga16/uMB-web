import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

/**
 * Componente para proteger rutas que requieren autenticación
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente hijo a renderizar si está autenticado
 * @param {boolean} props.requireAdmin - Si requiere rol de administrador
 * @returns {React.ReactNode}
 */
function ProtectedRoute({ children, requireAdmin = false }) {
  // Verificar si el usuario está autenticado
  if (!authService.estaAutenticado()) {
    // Si no está autenticado, redirigir a login
    return <Navigate to="/login" replace />;
  }
  
  // Si requiere admin y el usuario no es admin
  if (requireAdmin && !authService.esAdmin()) {
    // Redirigir al dashboard si no tiene permisos
    return <Navigate to="/dashboard" replace />;
  }
  
  // Si pasa todas las validaciones, renderizar el componente hijo
  return children;
}

export default ProtectedRoute;
