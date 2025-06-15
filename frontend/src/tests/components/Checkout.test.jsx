import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../store/slices/cartSlice';
import Checkout from '../../components/Checkout';

// Mock del servicio de órdenes
jest.mock('../../services/ordersService', () => ({
  createOrder: jest.fn(),
  getPaymentMethods: jest.fn(() => Promise.resolve([
    { id: 1, name: 'Efectivo' },
    { id: 2, name: 'Tarjeta de Crédito' }
  ]))
}));

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

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

describe('Checkout Component', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    
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

  test('renderiza el componente de checkout', () => {
    renderCheckout();
    
    // Verificar que el título está presente
    expect(screen.getByText(/finalizar compra/i)).toBeInTheDocument();
    
    // Verificar que el resumen del pedido está presente
    expect(screen.getByText(/resumen del pedido/i)).toBeInTheDocument();
  });

  test('muestra los productos en el resumen', () => {
    renderCheckout();
    
    // Verificar que los productos aparecen
    expect(screen.getByText(/café americano/i)).toBeInTheDocument();
    expect(screen.getByText(/café latte/i)).toBeInTheDocument();
    
    // Verificar que el total aparece
    expect(screen.getByText(/total/i)).toBeInTheDocument();
  });

  test('renderiza los campos del formulario', () => {
    renderCheckout();
    
    // Verificar campos del formulario
    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument();
    
    // Verificar botón de envío
    expect(screen.getByText(/confirmar pedido/i)).toBeInTheDocument();
  });

  test('permite llenar los campos del formulario', () => {
    renderCheckout();
    
    const nameInput = screen.getByLabelText(/nombre/i);
    const emailInput = screen.getByLabelText(/email/i);
    const phoneInput = screen.getByLabelText(/teléfono/i);
    
    // Llenar campos
    fireEvent.change(nameInput, { target: { value: 'Juan Pérez' } });
    fireEvent.change(emailInput, { target: { value: 'juan@test.com' } });
    fireEvent.change(phoneInput, { target: { value: '123456789' } });
    
    // Verificar que se llenaron
    expect(nameInput.value).toBe('Juan Pérez');
    expect(emailInput.value).toBe('juan@test.com');
    expect(phoneInput.value).toBe('123456789');
  });

  test('renderiza correctamente con carrito vacío', () => {
    // Store con carrito vacío
    const emptyStore = configureStore({
      reducer: {
        cart: cartReducer
      },
      preloadedState: {
        cart: {
          items: [],
          total: 0
        }
      }
    });

    render(
      <Provider store={emptyStore}>
        <BrowserRouter>
          <Checkout />
        </BrowserRouter>
      </Provider>
    );
    
    // El componente debería manejar carrito vacío sin errores
    expect(screen.getByText(/finalizar compra/i)).toBeInTheDocument();
  });
}); 