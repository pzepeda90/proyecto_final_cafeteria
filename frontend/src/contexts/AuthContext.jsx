import React, { createContext, useContext } from 'react';
import { useSelector } from 'react-redux';

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto
export const AuthProvider = ({ children }) => {
  // Obtener datos del store de Redux
  const { user, token, isLoading, error } = useSelector(state => state.auth);
  
  // Determinar si el usuario está autenticado
  const isAuthenticated = !!(user && token);

  // Valor del contexto
  const value = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext }; 