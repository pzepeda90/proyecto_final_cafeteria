import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../constants/roles';
import { mockUsers } from '../../mocks/authMock';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const LoginPage = () => {
  const location = useLocation();
  const { login, error, status, clearError } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (err) {
      // El error ya se maneja en el hook useAuth
    }
  };

  const handleDemoLogin = async (userType) => {
    const demoUser = mockUsers.find((user) => user.role === userType);
    if (demoUser) {
      try {
        await login(demoUser.email, demoUser.password);
      } catch (err) {
        // El error ya se maneja en el hook useAuth
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">
          Iniciar Sesión
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Ingresa tus credenciales para acceder al sistema
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <Input
          label="Correo Electrónico"
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

        {error && (
          <Alert variant="error" title="Error de autenticación">
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          className="w-full"
          isLoading={status === 'loading'}
        >
          Iniciar Sesión
        </Button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              Cuentas de prueba
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3">
          <Button
            variant="outline"
            onClick={() => handleDemoLogin(ROLES.ADMIN)}
            disabled={status === 'loading'}
          >
            Ingresar como Administrador
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin(ROLES.VENDEDOR)}
            disabled={status === 'loading'}
          >
            Ingresar como Vendedor
          </Button>
          <Button
            variant="outline"
            onClick={() => handleDemoLogin(ROLES.CLIENTE)}
            disabled={status === 'loading'}
          >
            Ingresar como Cliente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 