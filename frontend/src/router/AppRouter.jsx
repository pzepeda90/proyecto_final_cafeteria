import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { lazy, Suspense } from 'react';
import { PRIVATE_ROUTES, PUBLIC_ROUTES } from '../constants/routes';
import { ROLES } from '../constants/roles';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ClientLayout from '../layouts/ClientLayout';
import MainLayout from '../layouts/MainLayout';

// Páginas públicas
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ProductsPage from '../pages/products/ProductsPage';
import ProductReviewsPage from '../pages/products/ProductReviewsPage';
import NotFound from '../pages/NotFound';

// Páginas comunes
import Profile from '../pages/Profile';
import Settings from '../pages/Settings';

// Páginas de cliente
import Cart from '../pages/client/Cart';
import Orders from '../pages/client/Orders';
import MyReviews from '../pages/client/MyReviews';

// Páginas de administrador (lazy loading para dashboards pesados)
const AdminDashboard = lazy(() => import('../pages/admin/Dashboard'));
import AdminOrders from '../pages/admin/orders/OrdersManagement';
import ProductsManagement from '../pages/admin/products/ProductsManagement';
import ProductForm from '../pages/admin/products/ProductForm';
import UsersManagement from '../pages/admin/users/UsersManagement';

// Loader component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Componente ProtectedRoute
const ProtectedRoute = ({ isAllowed, redirectTo, children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectTo} replace />;
  }
  return children;
};

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
        <Route path={PUBLIC_ROUTES.PRODUCT_REVIEWS} element={<ProductReviewsPage />} />
      </Route>

      {/* Rutas Protegidas Comunes */}
      <Route
        element={
          <ProtectedRoute
            isAllowed={isAuthenticated}
            redirectTo={PUBLIC_ROUTES.LOGIN}
          >
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path={PRIVATE_ROUTES.PROFILE} element={<Profile />} />
        <Route path={PRIVATE_ROUTES.SETTINGS} element={<Settings />} />
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
        <Route path={PRIVATE_ROUTES.CLIENTE.MY_REVIEWS} element={<MyReviews />} />
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
        <Route path={PRIVATE_ROUTES.ADMIN.DASHBOARD} element={
          <Suspense fallback={<LoadingSpinner />}>
            <AdminDashboard />
          </Suspense>
        } />
        <Route path={PRIVATE_ROUTES.ADMIN.ORDERS} element={<AdminOrders />} />
        <Route path={PRIVATE_ROUTES.ADMIN.PRODUCTS} element={<ProductsManagement />} />
        <Route path={PRIVATE_ROUTES.ADMIN.NEW_PRODUCT} element={<ProductForm />} />
        <Route path={PRIVATE_ROUTES.ADMIN.EDIT_PRODUCT()} element={<ProductForm />} />
        <Route path={PRIVATE_ROUTES.ADMIN.USERS} element={<UsersManagement />} />
      </Route>

      {/* Ruta por defecto */}
      <Route path="/" element={<Navigate to={PUBLIC_ROUTES.PRODUCTS} replace />} />
      
      {/* Página 404 - DEBE IR AL FINAL */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter; 