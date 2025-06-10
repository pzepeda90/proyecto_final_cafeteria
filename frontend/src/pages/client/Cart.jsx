import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { updateQuantity, removeFromCart, clearCart } from '../../store/slices/cartSlice';
import Button from '../../components/ui/Button';
import { PRIVATE_ROUTES } from '../../constants/routes';
import { ROLES } from '../../constants/roles';
import Swal from 'sweetalert2';
import { formatCurrency } from '../../utils/formatters';

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  didOpen: (toast) => {
    toast.addEventListener('mouseenter', Swal.stopTimer);
    toast.addEventListener('mouseleave', Swal.resumeTimer);
  }
});

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, total } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);
  const isAdmin = user?.role === ROLES.ADMIN;
  const isVendedor = user?.role === ROLES.VENDEDOR;

  const handleUpdateQuantity = (id, quantity, name) => {
    if (quantity <= 0) {
      handleRemoveItem(id, name);
      return;
    }
    
    dispatch(updateQuantity({ id, quantity }));
    Toast.fire({
      icon: 'info',
      title: `Cantidad actualizada: ${quantity}x ${name}`,
      background: '#60A5FA',
      color: '#ffffff'
    });
  };

  const handleRemoveItem = (id, name) => {
    dispatch(removeFromCart(id));
    Toast.fire({
      icon: 'error',
      title: `${name} eliminado del carrito`,
      background: '#EF4444',
      color: '#ffffff'
    });
  };

  const handleClearCart = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Se eliminarán todos los productos del carrito",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Sí, vaciar carrito',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      dispatch(clearCart());
      Toast.fire({
        icon: 'success',
        title: 'Carrito vaciado correctamente',
        background: '#10B981',
        color: '#ffffff'
      });
    }
  };

  const handleCheckout = () => {
    navigate(PRIVATE_ROUTES.CLIENTE.MY_ORDERS);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">
          {isAdmin || isVendedor ? 'Gestión de Carritos' : 'Mi Carrito'}
        </h1>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <p className="text-gray-600 mb-4">
            {isAdmin || isVendedor ? 'No hay carritos activos' : 'Tu carrito está vacío'}
          </p>
          <Button onClick={() => navigate(PRIVATE_ROUTES.PRODUCTS)}>
            Ver Productos
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {isAdmin || isVendedor ? 'Gestión de Carritos' : 'Mi Carrito'}
        </h1>
        {items.length > 0 && (
          <Button variant="danger" onClick={handleClearCart}>
            Vaciar Carrito
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flow-root">
          <ul className="-my-6 divide-y divide-gray-200">
            {items.map((item) => (
              <li key={item.id} className="py-6 flex">
                <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-center object-cover"
                  />
                </div>

                <div className="ml-4 flex-1 flex flex-col">
                  <div>
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>{item.name}</h3>
                      <p className="ml-4">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="flex-1 flex items-end justify-between text-sm">
                    <div className="flex items-center">
                      <button
                        className="p-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1, item.name)}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="mx-2 w-8 text-center">{item.quantity}</span>
                      <button
                        className="p-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1, item.name)}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </button>
                      <button
                        className="ml-4 p-1 text-red-500 hover:text-red-700"
                        onClick={() => handleRemoveItem(item.id, item.name)}
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
          <p>Total</p>
          <p>{formatCurrency(total)}</p>
        </div>
        <div className="mt-6">
          <Button
            className="w-full"
            onClick={handleCheckout}
            disabled={isAdmin || isVendedor}
          >
            {isAdmin || isVendedor ? 'Solo visualización' : 'Proceder al pago'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart; 