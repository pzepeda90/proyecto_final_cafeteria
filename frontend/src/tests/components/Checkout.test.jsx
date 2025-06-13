import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { clearCart } from '../../store/slices/cartSlice';
import Checkout from '../../components/Checkout';
import { orderService } from '../../services/orderService';

// Mock de productos en el carrito
const mockCartItems = [
  {
    id: 1,
    name: 'Café Americano',
    price: 2.5,
    quantity: 2,
    image: 'cafe-americano.jpg',
    stock: 10
  },
  {
    id: 2,
    name: 'Café Latte',
    price: 3.5,
    quantity: 1,
    image: 'cafe-latte.jpg',
    stock: 8
  }
];

// Mock del servicio de órdenes
jest.mock('../../services/orderService', () => ({
  orderService: {
    createOrder: jest.fn(),
    getPaymentMethods: jest.fn(() => Promise.resolve([
      { id: 1, name: 'Efectivo' },
      { id: 2, name: 'Tarjeta de Crédito' }
    ]))
  }
}));

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Checkout Component', () => {
  let store;

  beforeEach(() => {
    // Reset de los mocks
    jest.clearAllMocks();
    orderService.createOrder.mockResolvedValue({ id: 1, status: 'pending' });

    // Configuración del store
    store = configureStore({
      reducer: {
        cart: cartReducer
      },
      preloadedState: {
        cart: {
          items: [...mockCartItems],
          total: mockCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
        }
      }
    });
  });

  const renderCheckout = () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
  };

  // Test de renderizado del formulario
  it('renderiza el formulario de checkout correctamente', () => {
    renderCheckout();

    // Campos del formulario
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/método de pago/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmar pedido/i)).toBeInTheDocument();

    // Resumen del pedido
    expect(screen.getByText(/resumen del pedido/i)).toBeInTheDocument();
  });

  // Test del resumen del pedido
  it('muestra el resumen del pedido correctamente', () => {
    renderCheckout();

    // Productos
    expect(screen.getByText(/café americano \(2\)/i)).toBeInTheDocument();
    expect(screen.getByText(/café latte \(1\)/i)).toBeInTheDocument();

    // Subtotales
    expect(screen.getByText('$5.00')).toBeInTheDocument(); // 2.5 * 2
    expect(screen.getByText('$3.50')).toBeInTheDocument(); // 3.5 * 1

    // Total
    const total = mockCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    expect(screen.getByText(`Total: $${total.toFixed(2)}`)).toBeInTheDocument();
  });

  // Test de validación de campos
  it('valida todos los campos requeridos', async () => {
    renderCheckout();

    // Intentar enviar formulario vacío
    fireEvent.click(screen.getByText(/confirmar pedido/i));

    // Verificar mensajes de error
    await waitFor(() => {
      expect(screen.getByText(/el nombre es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/el email es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/la dirección es requerida/i)).toBeInTheDocument();
      expect(screen.getByText(/el teléfono es requerido/i)).toBeInTheDocument();
      expect(screen.getByText(/seleccione un método de pago/i)).toBeInTheDocument();
    });
  });

  // Test de validación de email
  it('valida el formato del email', async () => {
    renderCheckout();

    // Ingresar email inválido
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'email-invalido' }
    });

    // Perder foco del campo
    fireEvent.blur(screen.getByLabelText(/email/i));

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
    });
  });

  // Test de envío exitoso
  it('procesa el pedido correctamente con datos válidos', async () => {
    renderCheckout();

    // Llenar formulario
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'juan@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/dirección/i), {
      target: { value: 'Calle Principal 123' }
    });
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: '1234567890' }
    });
    fireEvent.change(screen.getByLabelText(/método de pago/i), {
      target: { value: '1' } // Efectivo
    });

    // Enviar pedido
    fireEvent.click(screen.getByText(/confirmar pedido/i));

    // Verificar llamada al servicio
    await waitFor(() => {
      expect(orderService.createOrder).toHaveBeenCalledWith({
        customerName: 'Juan Pérez',
        email: 'juan@example.com',
        address: 'Calle Principal 123',
        phone: '1234567890',
        paymentMethodId: '1',
        items: mockCartItems,
        total: mockCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0)
      });
    });

    // Verificar redirección y limpieza del carrito
    await waitFor(() => {
      expect(store.getState().cart.items).toHaveLength(0);
      expect(mockNavigate).toHaveBeenCalledWith('/order-success/1');
    });
  });

  // Test de manejo de errores
  it('maneja errores del servidor correctamente', async () => {
    orderService.createOrder.mockRejectedValueOnce(new Error('Error al procesar el pedido'));
    renderCheckout();

    // Llenar formulario
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Juan Pérez' }
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'juan@example.com' }
    });
    fireEvent.change(screen.getByLabelText(/dirección/i), {
      target: { value: 'Calle Principal 123' }
    });
    fireEvent.change(screen.getByLabelText(/teléfono/i), {
      target: { value: '1234567890' }
    });
    fireEvent.change(screen.getByLabelText(/método de pago/i), {
      target: { value: '1' }
    });

    // Enviar pedido
    fireEvent.click(screen.getByText(/confirmar pedido/i));

    // Verificar mensaje de error
    await waitFor(() => {
      expect(screen.getByText(/error al procesar el pedido/i)).toBeInTheDocument();
    });
  });

  // Test de carrito vacío
  it('redirige a la tienda si el carrito está vacío', () => {
    store.dispatch(clearCart());
    renderCheckout();

    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  // Test de métodos de pago
  it('carga y muestra los métodos de pago', async () => {
    renderCheckout();

    await waitFor(() => {
      const paymentSelect = screen.getByLabelText(/método de pago/i);
      expect(paymentSelect).toBeInTheDocument();
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3); // Incluyendo la opción por defecto
      expect(screen.getByText('Efectivo')).toBeInTheDocument();
      expect(screen.getByText('Tarjeta de Crédito')).toBeInTheDocument();
    });
  });

  // Test de formato de teléfono
  it('formatea el número de teléfono correctamente', () => {
    renderCheckout();

    const phoneInput = screen.getByLabelText(/teléfono/i);
    
    fireEvent.change(phoneInput, {
      target: { value: '1234567890' }
    });

    expect(phoneInput.value).toBe('(123) 456-7890');
  });

  // Test de persistencia de datos del formulario
  it('mantiene los datos del formulario al navegar', () => {
    renderCheckout();

    // Llenar formulario
    fireEvent.change(screen.getByLabelText(/nombre/i), {
      target: { value: 'Juan Pérez' }
    });

    // Simular navegación
    const { unmount } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );

    unmount();

    // Volver a renderizar
    renderCheckout();

    // Verificar que los datos persisten
    expect(screen.getByLabelText(/nombre/i)).toHaveValue('Juan Pérez');
  });
}); 