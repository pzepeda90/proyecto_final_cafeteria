import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import cartReducer from '../../store/slices/cartSlice';
import ProductList from '../../components/ProductList';
import { productService } from '../../services/productService';

// Mock de productos para pruebas
const mockProducts = [
  {
    id: 1,
    name: 'Café Americano',
    price: 2.5,
    image: 'cafe-americano.jpg',
    stock: 10,
    category: 'Café Caliente',
    description: 'Café negro con agua caliente',
    rating: 4.5
  },
  {
    id: 2,
    name: 'Café Latte',
    price: 3.5,
    image: 'cafe-latte.jpg',
    stock: 8,
    category: 'Café Caliente',
    description: 'Café con leche espumada',
    rating: 4.8
  },
  {
    id: 3,
    name: 'Frappuccino',
    price: 4.5,
    image: 'frappuccino.jpg',
    stock: 15,
    category: 'Café Frío',
    description: 'Bebida helada de café',
    rating: 4.2
  }
];

// Mock del servicio de productos
jest.mock('../../services/productService', () => ({
  getProducts: jest.fn(),
  getCategories: jest.fn(() => Promise.resolve(['Café Caliente', 'Café Frío', 'Postres'])),
  searchProducts: jest.fn()
}));

describe('ProductList Component', () => {
  let store;

  beforeEach(() => {
    // Reset de los mocks
    jest.clearAllMocks();
    productService.getProducts.mockResolvedValue(mockProducts);
    productService.searchProducts.mockResolvedValue(mockProducts);

    // Configuración del store
    store = configureStore({
      reducer: {
        cart: cartReducer
      }
    });
  });

  const renderProductList = () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <ProductList />
        </BrowserRouter>
      </Provider>
    );
  };

  // Test de renderizado inicial
  it('renderiza la lista de productos correctamente', async () => {
    renderProductList();

    // Verificar estado de carga
    expect(screen.getByText(/cargando productos/i)).toBeInTheDocument();

    await waitFor(() => {
      // Verificar productos
      expect(screen.getByText('Café Americano')).toBeInTheDocument();
      expect(screen.getByText('Café Latte')).toBeInTheDocument();
      expect(screen.getByText('Frappuccino')).toBeInTheDocument();

      // Verificar detalles de productos
      expect(screen.getByText('Café negro con agua caliente')).toBeInTheDocument();
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });
  });

  // Test de precios y formato
  it('muestra los precios correctamente formateados', async () => {
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText('$2.50')).toBeInTheDocument();
      expect(screen.getByText('$3.50')).toBeInTheDocument();
      expect(screen.getByText('$4.50')).toBeInTheDocument();
    });
  });

  // Test de agregar al carrito
  it('permite agregar productos al carrito y actualiza el estado', async () => {
    renderProductList();

    await waitFor(() => {
      const addButtons = screen.getAllByText(/agregar al carrito/i);
      fireEvent.click(addButtons[0]);
    });

    // Verificar estado del carrito
    const state = store.getState();
    expect(state.cart.items).toHaveLength(1);
    expect(state.cart.items[0]).toEqual({
      ...mockProducts[0],
      quantity: 1
    });

    // Verificar que el botón se actualiza
    await waitFor(() => {
      const updateButtons = screen.getAllByText(/en el carrito/i);
      expect(updateButtons[0]).toBeInTheDocument();
    });
  });

  // Test de filtrado por categoría
  it('permite filtrar productos por categoría', async () => {
    renderProductList();

    await waitFor(() => {
      const filterSelect = screen.getByLabelText(/filtrar por categoría/i);
      fireEvent.change(filterSelect, { target: { value: 'Café Frío' } });
    });

    // Verificar productos filtrados
    await waitFor(() => {
      expect(screen.queryByText('Café Americano')).not.toBeInTheDocument();
      expect(screen.queryByText('Café Latte')).not.toBeInTheDocument();
      expect(screen.getByText('Frappuccino')).toBeInTheDocument();
    });
  });

  // Test de búsqueda
  it('permite buscar productos por nombre', async () => {
    renderProductList();

    await waitFor(() => {
      const searchInput = screen.getByPlaceholderText(/buscar productos/i);
      fireEvent.change(searchInput, { target: { value: 'Latte' } });
    });

    // Simular respuesta de búsqueda
    productService.searchProducts.mockResolvedValueOnce([mockProducts[1]]);

    await waitFor(() => {
      expect(screen.queryByText('Café Americano')).not.toBeInTheDocument();
      expect(screen.getByText('Café Latte')).toBeInTheDocument();
      expect(screen.queryByText('Frappuccino')).not.toBeInTheDocument();
    });
  });

  // Test de manejo de errores
  it('muestra mensaje de error cuando falla la carga', async () => {
    productService.getProducts.mockRejectedValueOnce(new Error('Error al cargar productos'));
    renderProductList();

    await waitFor(() => {
      expect(screen.getByText(/error al cargar los productos/i)).toBeInTheDocument();
    });
  });

  // Test de productos sin stock
  it('deshabilita botón de agregar cuando no hay stock', async () => {
    const productsWithoutStock = [
      {
        ...mockProducts[0],
        stock: 0
      }
    ];
    productService.getProducts.mockResolvedValueOnce(productsWithoutStock);
    
    renderProductList();

    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /agregar al carrito/i });
      expect(addButton).toBeDisabled();
      expect(screen.getByText(/sin stock/i)).toBeInTheDocument();
    });
  });

  // Test de ordenamiento
  it('permite ordenar productos por precio', async () => {
    renderProductList();

    await waitFor(() => {
      const sortSelect = screen.getByLabelText(/ordenar por/i);
      fireEvent.change(sortSelect, { target: { value: 'price-asc' } });
    });

    const prices = screen.getAllByText(/\$\d+\.\d{2}/);
    const priceValues = prices.map(price => parseFloat(price.textContent.replace('$', '')));
    
    expect(priceValues).toEqual([2.50, 3.50, 4.50]);
  });

  // Test de paginación
  it('implementa paginación correctamente', async () => {
    const manyProducts = Array(20).fill().map((_, i) => ({
      ...mockProducts[0],
      id: i + 1,
      name: `Producto ${i + 1}`
    }));
    productService.getProducts.mockResolvedValueOnce(manyProducts);

    renderProductList();

    await waitFor(() => {
      // Verificar que solo se muestran los productos de la primera página
      expect(screen.getAllByTestId('product-card')).toHaveLength(12);
      
      // Verificar botones de paginación
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    // Cambiar de página
    fireEvent.click(screen.getByText('2'));

    await waitFor(() => {
      expect(screen.getByText('Producto 13')).toBeInTheDocument();
    });
  });

  // Test de vista de cuadrícula/lista
  it('permite cambiar entre vista de cuadrícula y lista', async () => {
    renderProductList();

    await waitFor(() => {
      const viewToggle = screen.getByLabelText(/cambiar vista/i);
      fireEvent.click(viewToggle);
    });

    expect(screen.getByTestId('product-list-view')).toHaveClass('list-view');

    const viewToggle = screen.getByLabelText(/cambiar vista/i);
    fireEvent.click(viewToggle);

    expect(screen.getByTestId('product-list-view')).toHaveClass('grid-view');
  });
}); 