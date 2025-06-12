import axios from 'axios';
import { API_BASE_URL } from '../constants/apiEndpoints';

// Usar URL por defecto si no está definida en variables de entorno
const baseURL = API_BASE_URL || 'http://localhost:3000/api';

// Crear instancia de axios configurada
const axiosInstance = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autorización
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Enviando petición a:', config.baseURL + config.url);
    console.log('Headers:', config.headers);
    console.log('Data:', config.data);
    return config;
  },
  (error) => {
    console.error('Error en request interceptor:', error);
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('Respuesta exitosa:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('Error en response:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

class AdminService {
  /**
   * Crear un nuevo vendedor
   */
  static async createVendedor(vendedorData) {
    try {
      console.log('Creando vendedor con datos:', vendedorData);
      
      const response = await axiosInstance.post('/vendedores', {
        nombre: vendedorData.nombre,
        apellido: vendedorData.apellido,
        email: vendedorData.email,
        password: vendedorData.password,
        telefono: vendedorData.telefono || ''
      });
      
      console.log('Vendedor creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error completo al crear vendedor:', error);
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
      console.error('Request config:', error.config);
      
      // Crear mensaje de error más detallado
      let errorMessage = 'Error al crear vendedor';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 401:
            errorMessage = 'No autorizado. Por favor, inicia sesión nuevamente.';
            break;
          case 403:
            errorMessage = 'No tienes permisos para crear vendedores. Se requiere rol de administrador.';
            break;
          case 400:
            errorMessage = data?.mensaje || 'Datos inválidos para crear vendedor';
            break;
          case 500:
            errorMessage = 'Error interno del servidor al crear vendedor';
            break;
          default:
            errorMessage = data?.mensaje || `Error ${status} al crear vendedor`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor. Verifica que el backend esté funcionando.';
      } else {
        errorMessage = error.message || 'Error desconocido al crear vendedor';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Crear un nuevo usuario (cliente)
   */
  static async createUsuario(userData) {
    try {
      console.log('Creando usuario con datos:', userData);
      
      const response = await axiosInstance.post('/usuarios/registro', {
        nombre: userData.nombre,
        apellido: userData.apellido,
        email: userData.email,
        password: userData.password,
        telefono: userData.telefono || '',
        fecha_nacimiento: userData.fecha_nacimiento || null
      });
      
      console.log('Usuario creado exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear usuario:', error);
      console.error('Response data:', error.response?.data);
      
      let errorMessage = 'Error al crear usuario';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data?.mensaje || 'Datos inválidos para crear usuario';
            break;
          case 500:
            errorMessage = 'Error interno del servidor al crear usuario';
            break;
          default:
            errorMessage = data?.mensaje || `Error ${status} al crear usuario`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Obtener todos los vendedores
   */
  static async getVendedores() {
    try {
      const response = await axiosInstance.get('/vendedores');
      return response.data;
    } catch (error) {
      console.error('Error al obtener vendedores:', error);
      throw new Error('Error al obtener vendedores');
    }
  }

  /**
   * Actualizar vendedor
   */
  static async updateVendedor(id, vendedorData) {
    try {
      const response = await axiosInstance.put(`/vendedores/${id}`, {
        nombre: vendedorData.nombre,
        apellido: vendedorData.apellido,
        email: vendedorData.email,
        telefono: vendedorData.telefono || '',
        activo: vendedorData.activo
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar vendedor:', error);
      let errorMessage = 'Error al actualizar vendedor';
      
      if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para actualizar vendedores';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Eliminar vendedor
   */
  static async deleteVendedor(id) {
    try {
      const response = await axiosInstance.delete(`/vendedores/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error al eliminar vendedor:', error);
      let errorMessage = 'Error al eliminar vendedor';
      
      if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para eliminar vendedores';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      throw new Error(errorMessage);
    }
  }

  // ==================== GESTIÓN DE MESAS ====================

  /**
   * Obtener todas las mesas
   */
  static async getMesas() {
    try {
      const response = await axiosInstance.get('/mesas');
      return response.data;
    } catch (error) {
      console.error('Error al obtener mesas:', error);
      throw new Error('Error al obtener mesas');
    }
  }

  /**
   * Crear una nueva mesa
   */
  static async createMesa(mesaData) {
    try {
      console.log('Creando mesa con datos:', mesaData);
      
      const response = await axiosInstance.post('/mesas', {
        numero: mesaData.numero,
        capacidad: mesaData.capacidad,
        ubicacion: mesaData.ubicacion || '',
        disponible: mesaData.disponible !== undefined ? mesaData.disponible : true
      });
      
      console.log('Mesa creada exitosamente:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error al crear mesa:', error);
      
      let errorMessage = 'Error al crear mesa';
      
      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;
        
        switch (status) {
          case 400:
            errorMessage = data?.mensaje || 'Datos inválidos para crear mesa';
            break;
          case 409:
            errorMessage = 'Ya existe una mesa con ese número';
            break;
          case 500:
            errorMessage = 'Error interno del servidor al crear mesa';
            break;
          default:
            errorMessage = data?.mensaje || `Error ${status} al crear mesa`;
        }
      } else if (error.request) {
        errorMessage = 'No se pudo conectar con el servidor';
      }
      
      throw new Error(errorMessage);
    }
  }

  /**
   * Actualizar mesa
   */
  static async updateMesa(id, mesaData) {
    try {
      const response = await axiosInstance.put(`/mesas/${id}`, {
        numero: mesaData.numero,
        capacidad: mesaData.capacidad,
        ubicacion: mesaData.ubicacion || '',
        disponible: mesaData.disponible
      });
      return response.data;
    } catch (error) {
      console.error('Error al actualizar mesa:', error);
      let errorMessage = 'Error al actualizar mesa';
      
      if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para actualizar mesas';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      throw new Error(errorMessage);
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
      let errorMessage = 'Error al eliminar mesa';
      
      if (error.response?.status === 403) {
        errorMessage = 'No tienes permisos para eliminar mesas';
      } else if (error.response?.data?.mensaje) {
        errorMessage = error.response.data.mensaje;
      }
      
      throw new Error(errorMessage);
    }
  }
}

export default AdminService; 