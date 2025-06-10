import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROLES } from '../../constants/roles';
import { PUBLIC_ROUTES, PRIVATE_ROUTES } from '../../constants/routes';
import { logout } from '../../store/slices/authSlice';
import Button from '../ui/Button';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate(PUBLIC_ROUTES.LOGIN);
  };

  const getNavLinks = () => {
    if (!isAuthenticated) return [];

    const commonLinks = [
      { id: 'dashboard', to: PRIVATE_ROUTES.DASHBOARD, label: 'Inicio' },
      { id: 'products', to: PRIVATE_ROUTES.PRODUCTS, label: 'Productos' },
    ];

    const roleSpecificLinks = {
      [ROLES.ADMIN]: [
        { id: 'manage-products', to: PRIVATE_ROUTES.ADMIN.PRODUCTS, label: 'Gestionar Productos' },
        { id: 'manage-orders', to: PRIVATE_ROUTES.ADMIN.ORDERS, label: 'Gestionar Pedidos' },
      ],
      [ROLES.VENDEDOR]: [
        { id: 'my-products', to: PRIVATE_ROUTES[ROLES.VENDEDOR].MY_PRODUCTS, label: 'Mis Productos' },
        { id: 'my-orders', to: PRIVATE_ROUTES[ROLES.VENDEDOR].MY_ORDERS, label: 'Mis Pedidos' },
      ],
      [ROLES.CLIENTE]: [
        { id: 'cart', to: PRIVATE_ROUTES.CART, label: 'Carrito' },
        { id: 'client-orders', to: PRIVATE_ROUTES.CLIENTE.MY_ORDERS, label: 'Mis Pedidos' },
      ],
    };

    return [...commonLinks, ...(roleSpecificLinks[user?.role] || [])];
  };

  return (
    <nav className="bg-white shadow w-full">
      <div className="w-full px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-2xl font-bold text-primary">
                L'BANDITO
              </Link>
            </div>
            <div className="hidden sm:flex items-center">
              {getNavLinks().map((link) => (
                <Link
                  key={link.id}
                  to={link.to}
                  className="inline-flex items-center px-3 text-sm font-medium text-gray-900 hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {user?.nombre} ({ROLES[user?.role]})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <div className="space-x-4">
                <Link to={PUBLIC_ROUTES.LOGIN} key="login-desktop">
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to={PUBLIC_ROUTES.REGISTER} key="register-desktop">
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Menú móvil */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Abrir menú</span>
              {/* Icono de menú */}
              <svg
                className="h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Panel móvil */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {getNavLinks().map((link) => (
              <Link
                key={`mobile-${link.id}`}
                to={link.to}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1">
                <span className="block px-3 py-2 text-base font-medium text-gray-700">
                  {user?.nombre} ({ROLES[user?.role]})
                </span>
                <button
                  className="block w-full text-left px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to={PUBLIC_ROUTES.LOGIN}
                  key="login-mobile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to={PUBLIC_ROUTES.REGISTER}
                  key="register-mobile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 