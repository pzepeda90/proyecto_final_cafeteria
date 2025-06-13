import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../store/slices/cartSlice';
import { useCart } from '../../hooks/useCart';

const mockProduct = {
  id: 1,
  name: 'Café Americano',
  price: 2.5,
  quantity: 1,
  stock: 10
};

describe('useCart Hook', () => {
  let store;

  beforeEach(() => {
    store = configureStore({
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
  });

  const wrapper = ({ children }) => (
    <Provider store={store}>
      {children}
    </Provider>
  );

  it('inicia con el carrito vacío', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('permite agregar productos al carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(mockProduct);
    expect(result.current.totalAmount).toBe(mockProduct.price * mockProduct.quantity);
  });

  it('permite eliminar productos del carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.removeFromCart(mockProduct.id);
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('permite actualizar la cantidad de productos', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQuantity(mockProduct.id, 2);
    });

    expect(result.current.items[0].quantity).toBe(2);
    expect(result.current.totalAmount).toBe(mockProduct.price * 2);
  });

  it('respeta el límite de stock al actualizar cantidad', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQuantity(mockProduct.id, mockProduct.stock + 1);
    });

    expect(result.current.items[0].quantity).toBe(mockProduct.stock);
  });

  it('no permite cantidades negativas', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    act(() => {
      result.current.updateQuantity(mockProduct.id, -1);
    });

    expect(result.current.items[0].quantity).toBe(1);
  });

  it('permite limpiar el carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.clearCart();
    });

    expect(result.current.items).toHaveLength(0);
    expect(result.current.totalAmount).toBe(0);
  });

  it('calcula correctamente el total del carrito', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const products = [
      { ...mockProduct },
      { ...mockProduct, id: 2, price: 3.5, quantity: 2 }
    ];

    act(() => {
      products.forEach(product => result.current.addToCart(product));
    });

    const expectedTotal = products.reduce((total, product) => total + (product.price * product.quantity), 0);
    expect(result.current.totalAmount).toBe(expectedTotal);
  });

  it('no permite agregar productos sin stock', () => {
    const { result } = renderHook(() => useCart(), { wrapper });

    const productWithoutStock = { ...mockProduct, stock: 0 };

    act(() => {
      result.current.addToCart(productWithoutStock);
    });

    expect(result.current.items).toHaveLength(0);
  });

  it('mantiene el estado entre renderizados', () => {
    const { result, rerender } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart(mockProduct);
    });

    rerender();

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0]).toEqual(mockProduct);
  });
}); 