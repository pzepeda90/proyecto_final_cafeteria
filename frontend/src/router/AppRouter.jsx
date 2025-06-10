import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ClientLayout from '../layouts/ClientLayout';

// Páginas públicas
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProductsPage from '../pages/products/ProductsPage';

// Páginas de cliente
import Cart from '../pages/client/Cart';
import Orders from '../pages/client/Orders';

// Páginas de administrador
import AdminDashboard from '../pages/admin/Dashboard';
import AdminOrders from '../pages/admin/orders/OrdersManagement';
import ProductsManagement from '../pages/admin/products/ProductsManagement';
import ProductForm from '../pages/admin/products/ProductForm';
import UsersManagement from '../pages/admin/users/UsersManagement';

const AppRouter = () => {
  const { user } = useSelector(state => state.auth);
  const isAuthenticated = !!user;
  const userRole = user?.role || null;

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route element={<PublicLayout />}>
        <Route path={PUBLIC_ROUTES.LOGIN} element={<LoginPage />} />
        <Route path={PUBLIC_ROUTES.REGISTER} element={<RegisterPage />} />
        <Route path={PUBLIC_ROUTES.PRODUCTS} element={<ProductsPage />} />
      </Route>

      {/* Rutas de Cliente */}
      <Route
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated && userRole === ROLES.CLIENTE}
            redirectTo={PUBLIC_ROUTES.LOGIN}
          >
            <ClientLayout />
          </ProtectedRoute>
        }
      >
        <Route path={PRIVATE_ROUTES.CART} element={<Cart />} />
        <Route path={PRIVATE_ROUTES.CLIENTE.MY_ORDERS} element={<Orders />} />
      </Route>

      {/* Rutas de Administrador */}
      <Route
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated && userRole === ROLES.ADMIN}
            redirectTo={PUBLIC_ROUTES.LOGIN}
          >
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path={PRIVATE_ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />
        <Route path={PRIVATE_ROUTES.ADMIN.ORDERS} element={<AdminOrders />} />
        <Route path={PRIVATE_ROUTES.ADMIN.PRODUCTS} element={<ProductsManagement />} />
        <Route path={PRIVATE_ROUTES.ADMIN.NEW_PRODUCT} element={<ProductForm />} />
        <Route path={PRIVATE_ROUTES.ADMIN.EDIT_PRODUCT()} element={<ProductForm />} />
        <Route path={PRIVATE_ROUTES.ADMIN.USERS} element={<UsersManagement />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to={PUBLIC_ROUTES.PRODUCTS} replace />} />
      <Route path="*" element={<Navigate to={PUBLIC_ROUTES.PRODUCTS} replace />} />
    </Routes>
  );
};

const ProtectedRoute = ({ isAllowed, redirectTo, children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

export default AppRouter; 