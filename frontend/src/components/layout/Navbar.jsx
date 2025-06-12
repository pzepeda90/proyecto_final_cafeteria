import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ROLES } from '../../constants/roles';
import { PUBLIC_ROUTES, PRIVATE_ROUTES } from '../../constants/routes';
import { logout } from '../../store/slices/authSlice';
import Button from '../ui/Button';
import Dropdown from '../ui/Dropdown';
import { formatCurrency } from '../../utils/formatters';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { items, total, quantity } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate(PUBLIC_ROUTES.LOGIN);
  };

  // Función para generar avatar con iniciales
  const getAvatarInitials = (nombre) => {
    if (!nombre) return 'U';
    const names = nombre.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return nombre[0].toUpperCase();
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
        { id: 'client-orders', to: PRIVATE_ROUTES.CLIENTE.MY_ORDERS, label: 'Mis Pedidos' },
      ],
    };

    return [...commonLinks, ...(roleSpecificLinks[user?.role] || [])];
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Mi Perfil',
      onClick: () => navigate(PRIVATE_ROUTES.PROFILE),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      key: 'settings',
      label: 'Configuración',
      onClick: () => navigate(PRIVATE_ROUTES.SETTINGS),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    },
    { divider: true },
    {
      key: 'logout',
      label: 'Cerrar Sesión',
      onClick: handleLogout,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      )
    }
  ];

  return (
    <nav className="bg-white shadow border-b border-gray-200 w-full">
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
                {/* Indicador del carrito para clientes */}
                {user?.role === ROLES.CLIENTE && (
                  <Link
                    to={PRIVATE_ROUTES.CART}
                    className="relative inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="flex flex-col items-start">
                      <span className="text-xs text-gray-500">Carrito</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{quantity} items</span>
                        <span className="text-primary font-bold">{formatCurrency(total)}</span>
                      </div>
                    </div>
                  </Link>
                )}

                <Dropdown
                  trigger={
                    <button className="flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors">
                      {/* Avatar con iniciales */}
                      <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-medium text-sm">
                        {getAvatarInitials(user?.nombre)}
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{user?.nombre}</span>
                        <span className="text-xs text-gray-500">{ROLES[user?.role]}</span>
                      </div>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  }
                  items={userMenuItems}
                  position="bottom-right"
                />
              </div>
            ) : (
              <div className="space-x-4">
                <Link to={PUBLIC_ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link to={PUBLIC_ROUTES.REGISTER}>
                  <Button size="sm">
                    Registrarse
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Menú móvil */}
          <div className="flex items-center sm:hidden">
            {/* Carrito móvil para clientes */}
            {isAuthenticated && user?.role === ROLES.CLIENTE && (
              <Link
                to={PRIVATE_ROUTES.CART}
                className="relative inline-flex items-center p-2 mr-2 text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </Link>
            )}
            
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Abrir menú</span>
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
            
            {/* Carrito en móvil para clientes */}
            {isAuthenticated && user?.role === ROLES.CLIENTE && (
              <Link
                to={PRIVATE_ROUTES.CART}
                className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <div className="flex flex-col">
                  <span>Carrito ({quantity} items)</span>
                  <span className="text-sm text-primary font-bold">{formatCurrency(total)}</span>
                </div>
              </Link>
            )}
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-1">
                <div className="flex items-center px-3 py-2">
                  <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                    {getAvatarInitials(user?.nombre)}
                  </div>
                  <div className="ml-3">
                    <p className="text-base font-medium text-gray-800">{user?.nombre}</p>
                    <p className="text-sm text-gray-500">{ROLES[user?.role]}</p>
                  </div>
                </div>
                {userMenuItems.map((item) => !item.divider && (
                  <button
                    key={item.key}
                    className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                    onClick={() => {
                      item.onClick();
                      setIsMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to={PUBLIC_ROUTES.LOGIN}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Iniciar Sesión
                </Link>
                <Link
                  to={PUBLIC_ROUTES.REGISTER}
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