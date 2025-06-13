import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook para virtual scrolling
 * Optimiza el rendering de listas grandes mostrando solo elementos visibles
 * 
 * @param {Array} items - Array de elementos
 * @param {number} itemHeight - Altura de cada elemento en px
 * @param {number} containerHeight - Altura del contenedor en px
 * @param {number} overscan - Número de elementos extra a renderizar fuera del viewport
 * @returns {object} - Estado y funciones del virtual scrolling
 */
export const useVirtualScrolling = (
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  overscan = 5
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef(null);

  // Calcular elementos visibles
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    // Aplicar overscan
    const overscanStartIndex = Math.max(startIndex - overscan, 0);
    const overscanEndIndex = Math.min(endIndex + overscan, items.length - 1);

    return {
      startIndex: overscanStartIndex,
      endIndex: overscanEndIndex,
      visibleStartIndex: startIndex,
      visibleEndIndex: endIndex,
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Elementos visibles con overscan
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
      .map((item, index) => ({
        ...item,
        index: visibleRange.startIndex + index,
        style: {
          position: 'absolute',
          top: (visibleRange.startIndex + index) * itemHeight,
          height: itemHeight,
          width: '100%',
        },
      }));
  }, [items, visibleRange, itemHeight]);

  // Handler del scroll
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  // Scroll programático
  const scrollToIndex = useCallback((index) => {
    if (scrollElementRef.current) {
      const scrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = scrollTop;
      setScrollTop(scrollTop);
    }
  }, [itemHeight]);

  const scrollToTop = useCallback(() => {
    scrollToIndex(0);
  }, [scrollToIndex]);

  const scrollToBottom = useCallback(() => {
    scrollToIndex(items.length - 1);
  }, [scrollToIndex, items.length]);

  // Altura total del contenido
  const totalHeight = items.length * itemHeight;

  // Propiedades del contenedor
  const containerProps = {
    ref: scrollElementRef,
    onScroll: handleScroll,
    style: {
      height: containerHeight,
      overflow: 'auto',
      position: 'relative',
    },
  };

  // Propiedades del contenido
  const contentProps = {
    style: {
      height: totalHeight,
      position: 'relative',
    },
  };

  return {
    visibleItems,
    visibleRange,
    containerProps,
    contentProps,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    scrollTop,
    totalHeight,
  };
};

/**
 * Hook para lazy loading de imágenes
 * Carga imágenes solo cuando están en el viewport
 * 
 * @param {string} src - URL de la imagen
 * @param {object} options - Opciones de configuración
 * @returns {object} - Estado de la imagen
 */
export const useLazyImage = (src, options = {}) => {
  const {
    placeholder = '',
    threshold = 0.1,
    rootMargin = '50px',
  } = options;

  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  // Cargar imagen cuando esté en vista
  useEffect(() => {
    if (isInView && src) {
      const img = new Image();
      
      img.onload = () => {
        setIsLoaded(true);
        setError(null);
      };
      
      img.onerror = () => {
        setError(new Error('Failed to load image'));
      };
      
      img.src = src;
    }
  }, [isInView, src]);

  const imgProps = {
    ref: imgRef,
    src: isLoaded ? src : placeholder,
    loading: 'lazy',
    style: {
      opacity: isLoaded ? 1 : 0.5,
      transition: 'opacity 0.3s ease',
    },
  };

  return {
    imgProps,
    isLoaded,
    isInView,
    error,
  };
};

/**
 * Hook para infinite scrolling
 * Carga más datos automáticamente al llegar al final
 * 
 * @param {Function} loadMore - Función para cargar más datos
 * @param {boolean} hasMore - Si hay más datos disponibles
 * @param {object} options - Opciones de configuración
 * @returns {object} - Ref del trigger y estado
 */
export const useInfiniteScroll = (loadMore, hasMore, options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '100px',
    delay = 300,
  } = options;

  const [isLoading, setIsLoading] = useState(false);
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !isLoading) {
          // Debounce la carga
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
          }
          
          timeoutRef.current = setTimeout(async () => {
            setIsLoading(true);
            try {
              await loadMore();
            } catch (error) {
              console.error('Error loading more items:', error);
            } finally {
              setIsLoading(false);
            }
          }, delay);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (triggerRef.current) {
      observer.observe(triggerRef.current);
    }

    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loadMore, hasMore, isLoading, threshold, rootMargin, delay]);

  return {
    triggerRef,
    isLoading,
  };
};

/**
 * Hook para intersection observer genérico
 * Útil para animaciones, lazy loading, etc.
 * 
 * @param {object} options - Opciones del IntersectionObserver
 * @returns {Array} - [ref, isIntersecting, entry]
 */
export const useIntersectionObserver = (options = {}) => {
  const {
    threshold = 0,
    rootMargin = '0px',
    root = null,
    triggerOnce = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
        setEntry(entry);
        
        if (triggerOnce && entry.isIntersecting) {
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin,
        root,
      }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [threshold, rootMargin, root, triggerOnce]);

  return [elementRef, isIntersecting, entry];
};

/**
 * Hook para measuring de elementos
 * Obtiene las dimensiones de un elemento
 * 
 * @returns {Array} - [ref, dimensions]
 */
export const useElementSize = () => {
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 0,
  });
  const elementRef = useRef(null);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width, height });
      }
    });

    if (elementRef.current) {
      resizeObserver.observe(elementRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return [elementRef, dimensions];
}; 