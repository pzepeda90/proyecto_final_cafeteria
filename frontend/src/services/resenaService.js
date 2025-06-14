import axios from 'axios';

// Configuración directa como ordersService que funciona
const resenasAPI = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
resenasAPI.interceptors.request.use(
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

// Interceptor para manejar respuestas
resenasAPI.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Si el token ha expirado o no es válido, redirigir al login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    return Promise.reject(error);
  }
);

const resenaService = {
  // Obtener reseñas de un producto
  async obtenerResenasProducto(productoId) {
    try {
      const response = await resenasAPI.get(`/productos/${productoId}/resenas`);
      return response.data;
    } catch (error) {
      console.error('Error al obtener reseñas del producto:', error);
      throw error;
    }
  },

  // Crear una nueva reseña
  async crearResena(productoId, datosResena) {
    try {
      const response = await resenasAPI.post(`/productos/${productoId}/resenas`, datosResena);
      return response.data;
    } catch (error) {
      console.error('Error al crear reseña:', error);
      throw error;
    }
  },

  // Obtener mis reseñas
  async obtenerMisResenas() {
    try {
      const response = await resenasAPI.get('/resenas/mis-resenas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mis reseñas:', error);
      throw error;
    }
  },

  // Actualizar una reseña
  async actualizarResena(resenaId, datosResena) {
    try {
      const response = await resenasAPI.put(`/resenas/${resenaId}`, datosResena);
      return response.data;
    } catch (error) {
      console.error('Error al actualizar reseña:', error);
      throw error;
    }
  },

  // Eliminar una reseña
  async eliminarResena(resenaId) {
    try {
      const response = await resenasAPI.delete(`/resenas/${resenaId}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar reseña:', error);
      throw error;
    }
  }
};

export default resenaService; 