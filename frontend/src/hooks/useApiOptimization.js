import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Hook para optimizar peticiones API con cache, debouncing y memoización
 */

// Cache global para peticiones
const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Estructura de cache entry
const createCacheEntry = (data) => ({
  data,
  timestamp: Date.now(),
  isValid: () => Date.now() - this.timestamp < CACHE_DURATION,
});

export const useApiOptimization = () => {
  // Estado para tracking de peticiones
  const [pendingRequests] = useState(new Map());
  const abortControllerRef = useRef(null);

  // Limpiar requests al desmontar
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Obtener datos del cache
   * @param {string} key - Clave del cache
   * @returns {any|null} - Datos cacheados o null
   */
  const getCachedData = useCallback((key) => {
    const entry = apiCache.get(key);
    if (entry && entry.timestamp + CACHE_DURATION > Date.now()) {
      return entry.data;
    }
    
    // Limpiar entrada expirada
    if (entry) {
      apiCache.delete(key);
    }
    
    return null;
  }, []);

  /**
   * Guardar datos en cache
   * @param {string} key - Clave del cache
   * @param {any} data - Datos a cachear
   */
  const setCachedData = useCallback((key, data) => {
    apiCache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }, []);

  /**
   * Limpiar cache específico o todo el cache
   * @param {string|null} key - Clave específica o null para limpiar todo
   */
  const clearCache = useCallback((key = null) => {
    if (key) {
      apiCache.delete(key);
    } else {
      apiCache.clear();
    }
  }, []);

  /**
   * Crear clave de cache basada en parámetros
   * @param {string} endpoint - Endpoint de la API
   * @param {object} params - Parámetros de la petición
   * @returns {string} - Clave de cache
   */
  const createCacheKey = useCallback((endpoint, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});
    
    return `${endpoint}:${JSON.stringify(sortedParams)}`;
  }, []);

  /**
   * Petición optimizada con cache y deduplicación
   * @param {Function} requestFn - Función que realiza la petición
   * @param {string} cacheKey - Clave para el cache
   * @param {object} options - Opciones de configuración
   * @returns {Promise} - Promesa con los datos
   */
  const optimizedRequest = useCallback(async (requestFn, cacheKey, options = {}) => {
    const {
      useCache = true,
      deduplicate = true,
      timeout = 10000,
    } = options;

    // Verificar cache primero
    if (useCache) {
      const cachedData = getCachedData(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    // Deduplicar peticiones idénticas
    if (deduplicate && pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }

    // Crear AbortController para timeout
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    // Configurar timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, timeout);

    // Crear la promesa de petición
    const requestPromise = requestFn({ signal: abortController.signal })
      .then((response) => {
        clearTimeout(timeoutId);
        
        // Cachear la respuesta si fue exitosa
        if (useCache && response) {
          setCachedData(cacheKey, response);
        }
        
        return response;
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        
        // No cachear errores
        throw error;
      })
      .finally(() => {
        // Limpiar del pending requests
        pendingRequests.delete(cacheKey);
      });

    // Agregar a pending requests para deduplicación
    if (deduplicate) {
      pendingRequests.set(cacheKey, requestPromise);
    }

    return requestPromise;
  }, [getCachedData, setCachedData, pendingRequests]);

  /**
   * Invalidar cache por patrón
   * @param {string|RegExp} pattern - Patrón para invalidar
   */
  const invalidateCache = useCallback((pattern) => {
    const keys = Array.from(apiCache.keys());
    
    keys.forEach((key) => {
      if (typeof pattern === 'string' && key.includes(pattern)) {
        apiCache.delete(key);
      } else if (pattern instanceof RegExp && pattern.test(key)) {
        apiCache.delete(key);
      }
    });
  }, []);

  /**
   * Obtener estadísticas del cache
   * @returns {object} - Estadísticas del cache
   */
  const getCacheStats = useCallback(() => {
    const totalEntries = apiCache.size;
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    apiCache.forEach((entry) => {
      if (now - entry.timestamp < CACHE_DURATION) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      totalEntries,
      validEntries,
      expiredEntries,
      hitRate: validEntries / totalEntries || 0,
    };
  }, []);

  return {
    optimizedRequest,
    getCachedData,
    setCachedData,
    clearCache,
    createCacheKey,
    invalidateCache,
    getCacheStats,
  };
};

/**
 * Hook para peticiones con debounce automático
 * @param {Function} requestFn - Función de petición
 * @param {any} dependency - Dependencia que trigger la petición
 * @param {number} delay - Delay del debounce (default: 300ms)
 * @param {object} options - Opciones adicionales
 * @returns {object} - Estado de la petición
 */
export const useApiWithDebounce = (requestFn, dependency, delay = 300, options = {}) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const debouncedDependency = useDebounce(dependency, delay);
  const { optimizedRequest, createCacheKey } = useApiOptimization();

  const memoizedRequestFn = useCallback(requestFn, [requestFn]);

  useEffect(() => {
    if (!debouncedDependency) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const cacheKey = createCacheKey('search', { query: debouncedDependency });
        const result = await optimizedRequest(memoizedRequestFn, cacheKey, options);
        setData(result);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [debouncedDependency, memoizedRequestFn, optimizedRequest, createCacheKey, options]);

  return { data, isLoading, error };
};

/**
 * Hook para paginación optimizada
 * @param {Function} requestFn - Función de petición
 * @param {object} config - Configuración inicial
 * @returns {object} - Estado y funciones de paginación
 */
export const useOptimizedPagination = (requestFn, config = {}) => {
  const {
    initialPage = 1,
    pageSize = 20,
    preloadNext = true,
    cachePages = true,
  } = config;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);

  const { optimizedRequest, createCacheKey } = useApiOptimization();

  // Cache para páginas
  const pagesCache = useRef(new Map());

  const fetchPage = useCallback(async (page, options = {}) => {
    const cacheKey = createCacheKey('pagination', { page, pageSize });
    
    // Verificar cache de páginas
    if (cachePages && pagesCache.current.has(page)) {
      return pagesCache.current.get(page);
    }

    const params = { page, limit: pageSize };
    const result = await optimizedRequest(
      () => requestFn(params),
      cacheKey,
      { useCache: cachePages, ...options }
    );

    // Cachear página
    if (cachePages) {
      pagesCache.current.set(page, result);
    }

    return result;
  }, [requestFn, pageSize, createCacheKey, optimizedRequest, cachePages]);

  const loadPage = useCallback(async (page) => {
    setIsLoading(true);
    
    try {
      const result = await fetchPage(page);
      
      if (page === 1) {
        setData(result.data || []);
      } else {
        setData(prev => [...prev, ...(result.data || [])]);
      }
      
      setTotal(result.total || 0);
      setHasMore(result.hasMore || false);
      setCurrentPage(page);

      // Precargar siguiente página
      if (preloadNext && result.hasMore) {
        fetchPage(page + 1).catch(() => {
          // Ignorar errores de precarga
        });
      }
    } catch (error) {
      console.error('Error loading page:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, preloadNext]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      loadPage(currentPage + 1);
    }
  }, [loadPage, currentPage, isLoading, hasMore]);

  const refresh = useCallback(() => {
    pagesCache.current.clear();
    loadPage(1);
  }, [loadPage]);

  // Cargar primera página
  useEffect(() => {
    loadPage(initialPage);
  }, [loadPage, initialPage]);

  return {
    data,
    isLoading,
    currentPage,
    hasMore,
    total,
    loadMore,
    refresh,
    loadPage,
  };
};

// Utility para limpiar cache periódicamente
export const startCacheCleanup = (interval = 10 * 60 * 1000) => {
  const cleanup = () => {
    const now = Date.now();
    const keysToDelete = [];

    apiCache.forEach((entry, key) => {
      if (now - entry.timestamp > CACHE_DURATION) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => apiCache.delete(key));
  };

  const cleanupInterval = setInterval(cleanup, interval);
  
  // Limpiar al cargar
  cleanup();

  return () => clearInterval(cleanupInterval);
}; 