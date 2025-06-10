import { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROLES } from './constants/roles';
import { PUBLIC_ROUTES, PRIVATE_ROUTES } from './constants/routes';
import { restoreSession } from './store/slices/authSlice';

// Layouts
const MainLayout = lazy(() => import('./layouts/MainLayout'));
const AuthLayout = lazy(() => import('./layouts/AuthLayout'));

// Pages
const HomePage = lazy(() => import('./pages/home/HomePage'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Admin Pages
const ManageProducts = lazy(() => import('./pages/admin/ManageProducts'));
const ProductsManagement = lazy(() => import('./pages/admin/products/ProductsManagement'));
const ManageOrders = lazy(() => import('./pages/admin/ManageOrders'));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement'));

// Seller Pages
const MyProducts = lazy(() => import('./pages/seller/MyProducts'));
const MyOrders = lazy(() => import('./pages/seller/MyOrders'));
const SellerPOS = lazy(() => import('./pages/seller/SellerPOS'));
const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));

// Client Pages
const Cart = lazy(() => import('./pages/client/Cart'));
const ClientOrders = lazy(() => import('./pages/client/Orders'));
const ClientDashboard = lazy(() => import('./pages/client/ClientDashboard'));

// Auth
const RoleBasedRoutes = lazy(() => import('./components/auth/RoleBasedRoutes'));

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(restoreSession());
  }, []); // Solo se ejecuta una vez al montar el componente

  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path={PRIVATE_ROUTES.PRODUCTS} element={<ProductsPage />} />
        </Route>

        {/* Rutas de autenticación */}
        <Route element={<AuthLayout />}>
          <Route
            path={PUBLIC_ROUTES.LOGIN}
            element={!isAuthenticated ? <Login /> : <Navigate to={PRIVATE_ROUTES.DASHBOARD} />}
          />
          <Route
            path={PUBLIC_ROUTES.REGISTER}
            element={!isAuthenticated ? <Register /> : <Navigate to={PRIVATE_ROUTES.DASHBOARD} />}
          />
        </Route>

        {/* Rutas privadas comunes */}
        <Route element={<RoleBasedRoutes />}>
          <Route element={<MainLayout />}>
            {/* Redirigir al dashboard específico según el rol */}
            <Route 
              path={PRIVATE_ROUTES.DASHBOARD} 
              element={
                user?.role === ROLES.ADMIN ? <Navigate to={PRIVATE_ROUTES.ADMIN.DASHBOARD} /> :
                user?.role === ROLES.VENDEDOR ? <SellerDashboard /> :
                user?.role === ROLES.CLIENTE ? <ClientDashboard /> :
                <Navigate to={PUBLIC_ROUTES.LOGIN} />
              } 
            />
          </Route>
        </Route>

        {/* Rutas de administrador */}
        <Route element={<RoleBasedRoutes allowedRoles={[ROLES.ADMIN]} />}>
          <Route element={<MainLayout />}>
            <Route path={PRIVATE_ROUTES.ADMIN.DASHBOARD} element={<Dashboard />} />
            <Route path={PRIVATE_ROUTES.ADMIN.PRODUCTS} element={<ProductsManagement />} />
            <Route path={PRIVATE_ROUTES.ADMIN.ORDERS} element={<ManageOrders />} />
            <Route path={PRIVATE_ROUTES.ADMIN.USERS} element={<UsersManagement />} />
          </Route>
        </Route>

        {/* Rutas de vendedor */}
        <Route element={<RoleBasedRoutes allowedRoles={[ROLES.VENDEDOR]} />}>
          <Route element={<MainLayout />}>
            <Route path={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS} element={<MyProducts />} />
            <Route path={PRIVATE_ROUTES[ROLES.VENDEDOR].MY_ORDERS} element={<MyOrders />} />
            <Route path={PRIVATE_ROUTES[ROLES.VENDEDOR].POS} element={<SellerPOS />} />
          </Route>
        </Route>

        {/* Rutas de cliente */}
        <Route element={<RoleBasedRoutes allowedRoles={[ROLES.CLIENTE]} />}>
          <Route element={<MainLayout />}>
            <Route path={PRIVATE_ROUTES.CLIENTE.MY_ORDERS} element={<ClientOrders />} />
          </Route>
        </Route>

        {/* Rutas compartidas entre roles */}
        <Route element={<RoleBasedRoutes allowedRoles={[ROLES.CLIENTE, ROLES.ADMIN, ROLES.VENDEDOR]} />}>
          <Route element={<MainLayout />}>
            <Route path={PRIVATE_ROUTES.CART} element={<Cart />} />
          </Route>
        </Route>

        {/* Ruta 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

export default App;
