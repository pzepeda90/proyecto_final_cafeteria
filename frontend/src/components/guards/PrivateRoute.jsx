import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PUBLIC_ROUTES } from '../../constants/routes';

const PrivateRoute = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to={PUBLIC_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Verificar si la ruta actual está permitida para el rol del usuario
  const currentPath = location.pathname;
  const userRole = user?.role;

  // Aquí podrías implementar una lógica más compleja de verificación de permisos
  // Por ahora solo verificamos que el usuario esté autenticado

  return <Outlet />;
};

export default PrivateRoute; 