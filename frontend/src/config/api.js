// Configuración de API que detecta automáticamente el entorno
const getApiUrl = () => {
  // En desarrollo
  if (import.meta.env.DEV) {
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
  }
  
  // En producción, usar la URL de producción directamente
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://proyecto-final-cafeteria.onrender.com';
  }
  
  // Fallback
  return 'https://proyecto-final-cafeteria.onrender.com';
};

export const API_BASE_URL = getApiUrl();
export const API_URL = `${API_BASE_URL}/api`;

console.log('🔧 Configuración de API:', {
  mode: import.meta.env.MODE,
  dev: import.meta.env.DEV,
  prod: import.meta.env.PROD,
  apiUrl: API_URL
}); 