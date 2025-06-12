import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

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

class MesasService {
  /**
   * Obtener todas las mesas
   */
  static async getMesas() {
    try {
      const response = await axiosInstance.get('/mesas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener mesas');
    }
  }

  /**
   * Obtener mesas disponibles
   */
  static async getMesasDisponibles() {
    try {
      const response = await axiosInstance.get('/mesas/disponibles');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mesas disponibles:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener mesas disponibles');
    }
  }

  /**
   * Obtener mesa por ID
   */
  static async getMesaById(id) {
    try {
      const response = await axiosInstance.get(`/mesas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener mesa:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al obtener mesa');
    }
  }

  /**
   * Crear nueva mesa
   */
  static async createMesa(mesaData) {
    try {
      const response = await axiosInstance.post('/mesas', mesaData);
      return response.data;
    } catch (error) {
      console.error('Error al crear mesa:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al crear mesa');
    }
  }

  /**
   * Actualizar mesa
   */
  static async updateMesa(id, mesaData) {
    try {
      const response = await axiosInstance.put(`/mesas/${id}`, mesaData);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar mesa');
    }
  }

  /**
   * Actualizar estado de mesa
   */
  static async updateEstadoMesa(id, estado) {
    try {
      const response = await axiosInstance.patch(`/mesas/${id}/estado`, { estado });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar estado de mesa:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al actualizar estado de mesa');
    }
  }

  /**
   * Eliminar mesa
   */
  static async deleteMesa(id) {
    try {
      const response = await axiosInstance.delete(`/mesas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar mesa:', error);
      throw new Error(error.response?.data?.mensaje || 'Error al eliminar mesa');
    }
  }
}

export default MesasService; 