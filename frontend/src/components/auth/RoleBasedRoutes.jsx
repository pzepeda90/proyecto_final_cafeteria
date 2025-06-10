import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ROLES } from '../../constants/roles';
import { PUBLIC_ROUTES, DEFAULT_ROUTES_BY_ROLE } from '../../constants/routes';

const RoleBasedRoutes = ({ allowedRoles }) => {
  const { isAuthenticated, user, status } = useSelector((state) => state.auth);
  const location = useLocation();

  // Esperar mientras se verifica la autenticación
  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated || !user) {
    return <Navigate to={PUBLIC_ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Si no se especifican roles permitidos, permitir acceso a cualquier usuario autenticado
  if (!allowedRoles) {
    return <Outlet />;
  }

  // Verificar si el rol del usuario está permitido
  if (!allowedRoles.includes(user.role)) {
    // Redirigir a la ruta por defecto según el rol del usuario
    const defaultRoute = DEFAULT_ROUTES_BY_ROLE[user.role] || PUBLIC_ROUTES.LOGIN;
    return <Navigate to={defaultRoute} replace />;
  }

  return <Outlet />;
};

export default RoleBasedRoutes; 