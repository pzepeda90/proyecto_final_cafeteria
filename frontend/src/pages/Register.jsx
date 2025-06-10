import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/slices/authSlice';
import { showError, showSuccess } from '../services/notificationService';

const Register = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      showError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // Aquí irá la llamada a la API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre: formData.nombre,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      dispatch(loginSuccess(data));
      showSuccess('¡Registro exitoso! Bienvenido.');
      navigate('/');
    } catch (error) {
      showError(error.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="px-6 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          Crear Cuenta
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">
              Nombre Completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
              placeholder="Juan Pérez"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              minLength={6}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brown-500 focus:border-brown-500"
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brown-600 hover:bg-brown-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-500 disabled:opacity-50"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="font-medium text-brown-600 hover:text-brown-500">
            Inicia sesión aquí
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register; 