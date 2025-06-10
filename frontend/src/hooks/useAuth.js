import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  startLoading,
  loginSuccess,
  loginFailure,
  registerSuccess,
  registerFailure,
  logout,
  updateProfile,
  clearError,
  selectAuth,
} from '../store/slices/authSlice';
import authService from '../services/authService';
import { ROLES } from '../constants/roles';
import { DEFAULT_ROUTES_BY_ROLE } from '../constants/routes';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const auth = useSelector(selectAuth);

  // Iniciar sesión
  const login = async (email, password) => {
    try {
      dispatch(startLoading());
      const data = await authService.login(email, password);
      dispatch(loginSuccess(data));
      
      // Navegar según el rol del usuario
      const defaultRoute = DEFAULT_ROUTES_BY_ROLE[data.user.role] || '/dashboard';
      navigate(defaultRoute);
    } catch (error) {
      dispatch(loginFailure(error.message || 'Error al iniciar sesión'));
      throw error;
    }
  };

  // Registrar usuario
  const register = async (userData) => {
    try {
      dispatch(startLoading());
      const data = await authService.register(userData);
      dispatch(registerSuccess(data));
      
      // Navegar según el rol del usuario
      const defaultRoute = DEFAULT_ROUTES_BY_ROLE[data.user.role] || '/dashboard';
      navigate(defaultRoute);
    } catch (error) {
      dispatch(registerFailure(error.message || 'Error al registrar usuario'));
      throw error;
    }
  };

  // Cerrar sesión
  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  // Actualizar perfil
  const handleUpdateProfile = async (userData) => {
    try {
      dispatch(startLoading());
      const data = await authService.updateProfile(userData);
      dispatch(updateProfile(data.user));
      return data;
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async (passwords) => {
    try {
      dispatch(startLoading());
      const data = await authService.changePassword(passwords);
      dispatch(clearError());
      return data;
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };

  // Solicitar recuperación de contraseña
  const handleRequestPasswordReset = async (email) => {
    try {
      dispatch(startLoading());
      const data = await authService.requestPasswordReset(email);
      dispatch(clearError());
      return data;
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };

  // Restablecer contraseña
  const handleResetPassword = async (token, newPassword) => {
    try {
      dispatch(startLoading());
      const data = await authService.resetPassword(token, newPassword);
      dispatch(clearError());
      return data;
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };

  return {
    // Estado
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    status: auth.status,
    error: auth.error,

    // Métodos
    login,
    register,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    changePassword: handleChangePassword,
    requestPasswordReset: handleRequestPasswordReset,
    resetPassword: handleResetPassword,
    clearError: () => dispatch(clearError()),
  };
};

export default useAuth; 