import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { addItem, removeItem, updateQuantity, clearCart } from '../../store/slices/cartSlice';
import Cart from '../../components/Cart';

// Mock de productos para pruebas
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
    stock: 5
  }
];

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Cart Component', () => {
  let store;

  beforeEach(() => {
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

  const renderCart = () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );
  };

  // Test de renderizado del carrito vacío
  it('renderiza el carrito vacío correctamente', () => {
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
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    expect(screen.getByText(/ir a la tienda/i)).toBeInTheDocument();
  });

  // Test de renderizado con productos
  it('muestra los productos y el total correctamente', () => {
    renderCart();

    // Verificar productos
    expect(screen.getByText('Café Americano')).toBeInTheDocument();
    expect(screen.getByText('Café Latte')).toBeInTheDocument();

    // Verificar precios individuales
    expect(screen.getByText('$2.50')).toBeInTheDocument();
    expect(screen.getByText('$3.50')).toBeInTheDocument();

    // Verificar total
    const total = mockCartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    expect(screen.getByText(`Total: $${total.toFixed(2)}`)).toBeInTheDocument();
  });

  // Test de eliminación de productos
  it('permite eliminar productos del carrito', async () => {
    renderCart();

    const removeButtons = screen.getAllByText(/eliminar/i);
    fireEvent.click(removeButtons[0]);

    await waitFor(() => {
      const items = store.getState().cart.items;
      expect(items).toHaveLength(1);
      expect(items[0].name).toBe('Café Latte');
      
      // Verificar que el total se actualizó
      const newTotal = items[0].price * items[0].quantity;
      expect(screen.getByText(`Total: $${newTotal.toFixed(2)}`)).toBeInTheDocument();
    });
  });

  // Test de actualización de cantidad
  it('permite actualizar la cantidad de productos', async () => {
    renderCart();

    // Incrementar cantidad
    const incrementButtons = screen.getAllByText('+');
    fireEvent.click(incrementButtons[0]);

    await waitFor(() => {
      expect(store.getState().cart.items[0].quantity).toBe(3);
    });

    // Decrementar cantidad
    const decrementButtons = screen.getAllByText('-');
    fireEvent.click(decrementButtons[0]);

    await waitFor(() => {
      expect(store.getState().cart.items[0].quantity).toBe(2);
    });
  });

  // Test de límites de cantidad
  it('respeta los límites de cantidad según el stock', async () => {
    renderCart();

    // Intentar incrementar más allá del stock
    const incrementButtons = screen.getAllByText('+');
    for (let i = 0; i < 10; i++) {
      fireEvent.click(incrementButtons[0]);
    }

    await waitFor(() => {
      // No debería exceder el stock
      expect(store.getState().cart.items[0].quantity).toBe(mockCartItems[0].stock);
    });

    // Intentar decrementar a menos de 1
    const decrementButtons = screen.getAllByText('-');
    for (let i = 0; i < mockCartItems[0].quantity + 1; i++) {
      fireEvent.click(decrementButtons[0]);
    }

    await waitFor(() => {
      // No debería ser menor a 1
      expect(store.getState().cart.items[0].quantity).toBe(1);
    });
  });

  // Test de navegación
  it('permite navegar a la tienda desde el carrito vacío', () => {
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
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    const shopButton = screen.getByText(/ir a la tienda/i);
    fireEvent.click(shopButton);

    expect(mockNavigate).toHaveBeenCalledWith('/products');
  });

  // Test de limpieza del carrito
  it('permite limpiar todo el carrito', async () => {
    renderCart();

    const clearButton = screen.getByText(/vaciar carrito/i);
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(store.getState().cart.items).toHaveLength(0);
      expect(store.getState().cart.total).toBe(0);
      expect(screen.getByText(/tu carrito está vacío/i)).toBeInTheDocument();
    });
  });

  // Test de persistencia del carrito
  it('mantiene el estado del carrito entre renderizados', () => {
    const { unmount } = render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    // Verificar estado inicial
    expect(store.getState().cart.items).toHaveLength(2);

    // Desmontar y volver a montar
    unmount();

    render(
      <Provider store={store}>
        <BrowserRouter>
          <Cart />
        </BrowserRouter>
      </Provider>
    );

    // Verificar que el estado se mantiene
    expect(store.getState().cart.items).toHaveLength(2);
    expect(screen.getByText('Café Americano')).toBeInTheDocument();
    expect(screen.getByText('Café Latte')).toBeInTheDocument();
  });

  // Test de cálculos de subtotal y total
  it('calcula correctamente subtotales y total', () => {
    renderCart();

    // Verificar subtotales
    const americanoSubtotal = mockCartItems[0].price * mockCartItems[0].quantity;
    const latteSubtotal = mockCartItems[1].price * mockCartItems[1].quantity;

    expect(screen.getByText(`$${americanoSubtotal.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByText(`$${latteSubtotal.toFixed(2)}`)).toBeInTheDocument();

    // Verificar total
    const total = americanoSubtotal + latteSubtotal;
    expect(screen.getByText(`Total: $${total.toFixed(2)}`)).toBeInTheDocument();
  });
}); 