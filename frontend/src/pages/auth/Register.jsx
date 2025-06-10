import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { PUBLIC_ROUTES } from '../../constants/routes';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    confirmPassword: '',
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

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implementar la lógica de registro
      console.log('Register:', formData);
    } catch (err) {
      setError(err.message || 'Error al registrar usuario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Crea tu cuenta
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        ¿Ya tienes una cuenta?{' '}
        <Link
          to={PUBLIC_ROUTES.LOGIN}
          className="font-medium text-primary hover:text-primary-dark"
        >
          Inicia sesión aquí
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
            label="Nombre completo"
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            autoComplete="name"
          />

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
            autoComplete="new-password"
          />

          <Input
            label="Confirmar contraseña"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
          />
          <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
            Acepto los{' '}
            <Link
              to="/terms"
              className="font-medium text-primary hover:text-primary-dark"
            >
              términos y condiciones
            </Link>
          </label>
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
        >
          Crear cuenta
        </Button>
      </form>
    </div>
  );
};

export default Register; 