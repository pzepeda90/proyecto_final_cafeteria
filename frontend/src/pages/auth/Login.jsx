import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PUBLIC_ROUTES } from '../../constants/routes';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // TODO: Implementar la lógica de inicio de sesión
      console.log('Login:', formData);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Inicia sesión en tu cuenta
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        ¿No tienes una cuenta?{' '}
        <Link
          to={PUBLIC_ROUTES.REGISTER}
          className="font-medium text-primary hover:text-primary-dark"
        >
          Regístrate aquí
        </Link>
      </p>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="space-y-4">
          <Input
            label="Correo electrónico"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <Input
            label="Contraseña"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
              Recordarme
            </label>
          </div>

          <div className="text-sm">
            <Link
              to="/forgot-password"
              className="font-medium text-primary hover:text-primary-dark"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Iniciar sesión
        </Button>
      </form>
    </div>
  );
};

export default Login; 