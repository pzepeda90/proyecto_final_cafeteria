import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Login from '../../pages/Login';
import { useAuth } from '../../hooks/useAuth';

// Mock del hook useAuth
jest.mock('../../hooks/useAuth', () => ({
  useAuth: jest.fn()
}));

// Mock de react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: { from: { pathname: '/dashboard' } }
  })
}));

describe('Login Component', () => {
  // Setup común para los tests
  const mockLogin = jest.fn();
  const mockClearError = jest.fn();

  beforeEach(() => {
    // Reset de los mocks antes de cada test
    mockLogin.mockReset();
    mockClearError.mockReset();
    mockNavigate.mockReset();

    // Mock del hook useAuth con valores por defecto
    useAuth.mockImplementation(() => ({
      login: mockLogin,
      error: null,
      status: 'idle',
      clearError: mockClearError
    }));
  });

  const renderLogin = () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <Login />
        </BrowserRouter>
      </Provider>
    );
  };

  // Test de renderizado
  it('renderiza el formulario de login correctamente', () => {
    renderLogin();
    expect(screen.getByLabelText(/correo electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    expect(screen.getByText(/¿no tienes una cuenta\?/i)).toBeInTheDocument();
    expect(screen.getByText(/regístrate aquí/i)).toBeInTheDocument();
  });

  // Test de validación de campos
  it('muestra error cuando los campos están vacíos', async () => {
    renderLogin();
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
    
    fireEvent.click(submitButton);
    
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
  });

  // Test de ingreso de datos
  it('permite ingresar datos en los campos', () => {
    renderLogin();
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  // Test de envío exitoso
  it('maneja el envío exitoso del formulario', async () => {
    mockLogin.mockResolvedValueOnce();
    renderLogin();

    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  // Test de error en el login
  it('muestra mensaje de error cuando falla el login', async () => {
    const errorMessage = 'Credenciales inválidas';
    useAuth.mockImplementation(() => ({
      login: mockLogin,
      error: errorMessage,
      status: 'error',
      clearError: mockClearError
    }));

    renderLogin();
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  // Test de estado de carga
  it('muestra estado de carga durante el proceso de login', async () => {
    useAuth.mockImplementation(() => ({
      login: mockLogin,
      error: null,
      status: 'loading',
      clearError: mockClearError
    }));

    renderLogin();
    const submitButton = screen.getByRole('button');

    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/iniciando sesión\.\.\./i)).toBeInTheDocument();
  });

  // Test de limpieza de errores
  it('limpia los errores al modificar los campos', () => {
    useAuth.mockImplementation(() => ({
      login: mockLogin,
      error: 'Error previo',
      status: 'error',
      clearError: mockClearError
    }));

    renderLogin();
    const emailInput = screen.getByLabelText(/correo electrónico/i);

    fireEvent.change(emailInput, { target: { value: 'nuevo@email.com' } });

    expect(mockClearError).toHaveBeenCalled();
  });

  // Test de navegación al registro
  it('permite navegar a la página de registro', () => {
    renderLogin();
    const registerLink = screen.getByText(/regístrate aquí/i);
    
    fireEvent.click(registerLink);
    
    expect(window.location.pathname).toBe('/register');
  });
}); 