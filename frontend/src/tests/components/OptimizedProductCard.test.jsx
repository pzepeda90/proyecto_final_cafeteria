import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer, { addItem, updateQuantity } from '../../store/slices/cartSlice';
import OptimizedProductCard from '../../components/OptimizedProductCard';

// Mock de producto para pruebas
const mockProduct = {
  id: 1,
  name: 'Café Americano',
  price: 2.5,
  image: 'cafe-americano.jpg',
  stock: 10,
  description: 'Delicioso café americano',
  category: 'Café Caliente',
  rating: 4.5,
  ingredients: ['Café', 'Agua caliente']
};

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('OptimizedProductCard', () => {
  let store;

  beforeEach(() => {
    // Reset de los mocks
    jest.clearAllMocks();

    // Configuración del store
    store = configureStore({
      reducer: {
        cart: cartReducer
      }
    });
  });

  const renderComponent = (props = {}) => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <OptimizedProductCard product={mockProduct} {...props} />
        </BrowserRouter>
      </Provider>
    );
  };

  // Test de renderizado básico
  it('renderiza correctamente la información del producto', () => {
    renderComponent();
    
    // Información básica
    expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(`$${mockProduct.price.toFixed(2)}`)).toBeInTheDocument();
    expect(screen.getByAltText(mockProduct.name)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.description)).toBeInTheDocument();
    
    // Información adicional
    expect(screen.getByText(mockProduct.category)).toBeInTheDocument();
    expect(screen.getByText(mockProduct.rating.toString())).toBeInTheDocument();
  });

  // Test de optimización de imagen
  it('implementa carga lazy y optimización de imagen', () => {
    renderComponent();
    
    const image = screen.getByAltText(mockProduct.name);
    expect(image).toHaveAttribute('src', mockProduct.image);
    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width');
    expect(image).toHaveAttribute('height');
  });

  // Test de producto sin stock
  it('maneja correctamente productos sin stock', () => {
    const productWithoutStock = { ...mockProduct, stock: 0 };
    renderComponent({ product: productWithoutStock });

    // Verificar estado de agotado
    expect(screen.getByText(/agotado/i)).toBeInTheDocument();
    expect(screen.queryByText(/agregar al carrito/i)).not.toBeInTheDocument();
    
    // Verificar estilos de agotado
    const stockBadge = screen.getByText(/agotado/i);
    expect(stockBadge).toHaveClass('out-of-stock');
  });

  // Test de interacción con el carrito
  describe('Interacción con el carrito', () => {
    it('agrega productos al carrito correctamente', async () => {
      renderComponent();
      
      const addButton = screen.getByText(/agregar al carrito/i);
      fireEvent.click(addButton);
      
      // Verificar estado del carrito
      await waitFor(() => {
        const state = store.getState();
        expect(state.cart.items).toHaveLength(1);
        expect(state.cart.items[0]).toEqual({
          ...mockProduct,
          quantity: 1
        });
      });

      // Verificar cambio en el botón
      expect(screen.getByText(/en el carrito/i)).toBeInTheDocument();
    });

    it('actualiza la cantidad cuando el producto ya está en el carrito', async () => {
      // Agregar producto al carrito primero
      store.dispatch(addItem({ ...mockProduct, quantity: 1 }));
      
      renderComponent();
      
      const updateButton = screen.getByText(/en el carrito/i);
      fireEvent.click(updateButton);
      
      // Verificar incremento de cantidad
      await waitFor(() => {
        const state = store.getState();
        expect(state.cart.items[0].quantity).toBe(2);
      });
    });

    it('respeta el límite de stock al agregar al carrito', async () => {
      // Agregar producto al carrito con cantidad máxima
      store.dispatch(addItem({ ...mockProduct, quantity: mockProduct.stock }));
      
      renderComponent();
      
      const updateButton = screen.getByText(/en el carrito/i);
      fireEvent.click(updateButton);
      
      // Verificar que no se excede el stock
      await waitFor(() => {
        const state = store.getState();
        expect(state.cart.items[0].quantity).toBe(mockProduct.stock);
      });

      // Verificar mensaje de stock máximo
      expect(screen.getByText(/stock máximo alcanzado/i)).toBeInTheDocument();
    });
  });

  // Test de navegación
  it('navega al detalle del producto al hacer clic', () => {
    renderComponent();
    
    const productLink = screen.getByRole('link');
    fireEvent.click(productLink);
    
    expect(mockNavigate).toHaveBeenCalledWith(`/product/${mockProduct.id}`);
  });

  // Test de renderizado condicional
  it('muestra u oculta elementos según las props', () => {
    // Renderizar sin descripción
    renderComponent({ showDescription: false });
    expect(screen.queryByText(mockProduct.description)).not.toBeInTheDocument();

    // Renderizar sin rating
    renderComponent({ showRating: false });
    expect(screen.queryByText(mockProduct.rating.toString())).not.toBeInTheDocument();
  });

  // Test de animaciones y efectos visuales
  it('aplica efectos visuales en la interacción', () => {
    renderComponent();
    
    const card = screen.getByTestId('product-card');
    
    // Hover effect
    fireEvent.mouseEnter(card);
    expect(card).toHaveClass('hover');
    
    fireEvent.mouseLeave(card);
    expect(card).not.toHaveClass('hover');
  });

  // Test de manejo de errores de imagen
  it('maneja errores de carga de imagen', () => {
    renderComponent();
    
    const image = screen.getByAltText(mockProduct.name);
    fireEvent.error(image);
    
    // Verificar imagen de fallback
    expect(image).toHaveAttribute('src', 'fallback-image.jpg');
  });

  // Test de accesibilidad
  it('cumple con los requisitos de accesibilidad', () => {
    renderComponent();
    
    // Verificar atributos ARIA
    const card = screen.getByTestId('product-card');
    expect(card).toHaveAttribute('role', 'article');
    
    const price = screen.getByText(`$${mockProduct.price.toFixed(2)}`);
    expect(price).toHaveAttribute('aria-label', `Precio: ${mockProduct.price.toFixed(2)} dólares`);
    
    const addButton = screen.getByRole('button');
    expect(addButton).toHaveAttribute('aria-label', `Agregar ${mockProduct.name} al carrito`);
  });

  // Test de responsive design
  it('aplica estilos responsive', () => {
    renderComponent();
    
    const card = screen.getByTestId('product-card');
    
    // Verificar clases responsive
    expect(card).toHaveClass('responsive');
    expect(card).toHaveStyle({
      maxWidth: '100%',
      width: expect.stringMatching(/\d+px|\d+%/)
    });
  });
}); 