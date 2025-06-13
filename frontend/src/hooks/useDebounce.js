import { useState, useEffect } from 'react';

/**
 * Hook para debouncing de valores
 * Útil para búsquedas, validaciones y peticiones API
 * 
 * @param {any} value - Valor a debounce
 * @param {number} delay - Delay en millisegundos (default: 300)
 * @returns {any} - Valor debounceed
 */
export const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Crear timer que actualiza el valor debounced después del delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpiar timer si value cambia antes del delay
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Hook para debouncing de callbacks
 * Útil para event handlers y funciones costosas
 * 
 * @param {Function} callback - Función a debounce
 * @param {number} delay - Delay en millisegundos
 * @param {Array} deps - Dependencias del callback
 * @returns {Function} - Función debounceed
 */
export const useDebouncedCallback = (callback, delay = 300, deps = []) => {
  const [debouncedCallback, setDebouncedCallback] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCallback(() => callback);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [callback, delay, ...deps]);

  return debouncedCallback;
};

/**
 * Hook para throttling de valores
 * Emite el valor máximo una vez por período
 * 
 * @param {any} value - Valor a throttle
 * @param {number} limit - Límite de tiempo en millisegundos
 * @returns {any} - Valor throttled
 */
export const useThrottle = (value, limit = 300) => {
  const [throttledValue, setThrottledValue] = useState(value);
  const [lastRan, setLastRan] = useState(Date.now());

  useEffect(() => {
    const timer = setTimeout(() => {
      if (Date.now() - lastRan >= limit) {
        setThrottledValue(value);
        setLastRan(Date.now());
      }
    }, limit - (Date.now() - lastRan));

    return () => {
      clearTimeout(timer);
    };
  }, [value, limit, lastRan]);

  return throttledValue;
}; 