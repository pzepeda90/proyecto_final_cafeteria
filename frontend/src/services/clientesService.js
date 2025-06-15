import axios from 'axios';
import { API_URL } from '../config/api';

// Configuración de axios con interceptores
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores de respuesta
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class ClientesService {
  /**
   * Buscar clientes por nombre, apellido, teléfono o email
   */
  static async searchClientes(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return [];
      }

      const response = await axiosInstance.get('/usuarios/buscar', {
        params: { q: searchTerm.trim() }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error al buscar clientes:', error);
      if (error.response?.status === 400) {
        return [];
      }
      throw new Error(error.response?.data?.mensaje || 'Error al buscar clientes');
    }
  }

  /**
   * Crear un nuevo cliente rápido (solo datos básicos)
   */
  static async createClienteRapido(clienteData) {
    try {
      // Generar email único si no se proporciona
      const emailUnico = clienteData.email && clienteData.email.trim() 
        ? clienteData.email.trim()
        : `cliente_${Date.now()}_${Math.random().toString(36).substr(2, 5)}@temp.com`;
      
      // Generar contraseña temporal única
      const passwordTemporal = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      
      const response = await axiosInstance.post('/usuarios/registro', {
        nombre: clienteData.nombre.trim(),
        apellido: clienteData.apellido?.trim() || 'Cliente',
        email: emailUnico,
        password: passwordTemporal,
        telefono: clienteData.telefono?.trim() || '',
        fecha_nacimiento: null // Campo opcional pero lo enviamos como null
      });
      
      return {
        id: response.data.user.id,
        nombre: response.data.user.nombre,
        apellido: response.data.user.apellido,
        email: response.data.user.email,
        telefono: clienteData.telefono?.trim() || '',
        nombreCompleto: `${response.data.user.nombre} ${response.data.user.apellido}`
      };
    } catch (error) {
      console.error('Error al crear cliente:', error);
      
      // Manejo específico de errores
      if (error.response?.status === 400) {
        const mensaje = error.response.data?.mensaje || 'Datos inválidos para crear cliente';
        throw new Error(mensaje);
      }
      
      throw new Error(error.response?.data?.mensaje || 'Error al crear cliente');
    }
  }
}

export default ClientesService; 