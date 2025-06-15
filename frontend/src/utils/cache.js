// Sistema de cache simple para optimizar llamadas a la API
class APICache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
    this.defaultTTL = 5 * 60 * 1000; // 5 minutos por defecto
  }

  // Generar clave de cache
  generateKey(url, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    return `${url}${sortedParams ? '?' + sortedParams : ''}`;
  }

  // Obtener datos del cache
  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expiry) {
      console.log('🎯 Cache HIT:', key);
      return cached.data;
    }
    
    if (cached) {
      console.log('⏰ Cache EXPIRED:', key);
      this.delete(key);
    }
    
    return null;
  }

  // Guardar datos en cache
  set(key, data, ttl = this.defaultTTL) {
    console.log('💾 Cache SET:', key, `TTL: ${ttl}ms`);
    
    // Limpiar timeout anterior si existe
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
    }

    // Guardar en cache
    this.cache.set(key, {
      data,
      expiry: Date.now() + ttl,
      timestamp: Date.now()
    });

    // Configurar auto-limpieza
    const timeout = setTimeout(() => {
      this.delete(key);
    }, ttl);
    
    this.timeouts.set(key, timeout);
  }

  // Eliminar del cache
  delete(key) {
    console.log('🗑️ Cache DELETE:', key);
    this.cache.delete(key);
    
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
  }

  // Limpiar todo el cache
  clear() {
    console.log('🧹 Cache CLEAR ALL');
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    this.cache.clear();
    this.timeouts.clear();
  }

  // Invalidar cache por patrón
  invalidatePattern(pattern) {
    console.log('🔄 Cache INVALIDATE PATTERN:', pattern);
    const regex = new RegExp(pattern);
    const keysToDelete = [];
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        keysToDelete.push(key);
      }
    }
    
    keysToDelete.forEach(key => this.delete(key));
  }

  // Obtener estadísticas del cache
  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      memory: JSON.stringify(Array.from(this.cache.entries())).length
    };
  }
}

// Instancia global del cache
export const apiCache = new APICache();

// Hook para usar cache con React
export const useCachedAPI = () => {
  return {
    get: (key) => apiCache.get(key),
    set: (key, data, ttl) => apiCache.set(key, data, ttl),
    delete: (key) => apiCache.delete(key),
    clear: () => apiCache.clear(),
    invalidatePattern: (pattern) => apiCache.invalidatePattern(pattern),
    generateKey: (url, params) => apiCache.generateKey(url, params)
  };
};

// Configuraciones de TTL por tipo de datos
export const CACHE_TTL = {
  PRODUCTS: 10 * 60 * 1000,      // 10 minutos - productos cambian poco
  ORDERS: 2 * 60 * 1000,         // 2 minutos - órdenes cambian más
  USER_DATA: 15 * 60 * 1000,     // 15 minutos - datos de usuario
  CATEGORIES: 30 * 60 * 1000,    // 30 minutos - categorías muy estables
  DASHBOARD: 5 * 60 * 1000,      // 5 minutos - dashboards
  REVIEWS: 5 * 60 * 1000         // 5 minutos - reseñas
};

export default apiCache; 