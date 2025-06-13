/**
 * Utilidades para optimización de imágenes y assets
 */

/**
 * Generar srcSet para imágenes responsivas
 * @param {string} baseUrl - URL base de la imagen
 * @param {Array} sizes - Array de tamaños [width, height]
 * @returns {string} - srcSet string
 */
export const generateSrcSet = (baseUrl, sizes = []) => {
  if (!baseUrl || !sizes.length) return '';
  
  return sizes
    .map(([width, height]) => {
      const url = height 
        ? `${baseUrl}?w=${width}&h=${height}` 
        : `${baseUrl}?w=${width}`;
      return `${url} ${width}w`;
    })
    .join(', ');
};

/**
 * Determinar el tamaño de imagen más apropiado según el dispositivo
 * @param {number} containerWidth - Ancho del contenedor
 * @param {number} devicePixelRatio - Ratio de pixeles del dispositivo
 * @returns {string} - Tamaño optimizado
 */
export const getOptimalImageSize = (containerWidth, devicePixelRatio = 1) => {
  const targetWidth = containerWidth * devicePixelRatio;
  
  // Tamaños estándar disponibles
  const standardSizes = [320, 640, 768, 1024, 1280, 1600, 1920, 2048];
  
  // Encontrar el tamaño más cercano (pero no menor)
  const optimalSize = standardSizes.find(size => size >= targetWidth) || 
                     standardSizes[standardSizes.length - 1];
  
  return optimalSize;
};

/**
 * Precargar imágenes críticas
 * @param {Array} imageUrls - URLs de imágenes a precargar
 * @param {Function} onProgress - Callback de progreso
 * @returns {Promise} - Promesa que se resuelve cuando todas las imágenes están cargadas
 */
export const preloadImages = async (imageUrls, onProgress = null) => {
  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ url, success: true });
      img.onerror = () => reject({ url, success: false, error: 'Failed to load' });
      img.src = url;
    });
  };

  const results = [];
  const total = imageUrls.length;

  for (let i = 0; i < imageUrls.length; i++) {
    try {
      const result = await loadImage(imageUrls[i]);
      results.push(result);
      
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          current: result,
        });
      }
    } catch (error) {
      results.push(error);
      
      if (onProgress) {
        onProgress({
          completed: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          current: error,
        });
      }
    }
  }

  return results;
};

/**
 * Comprimir imagen en el cliente
 * @param {File} file - Archivo de imagen
 * @param {object} options - Opciones de compresión
 * @returns {Promise<File>} - Imagen comprimida
 */
export const compressImage = (file, options = {}) => {
  const {
    quality = 0.8,
    maxWidth = 1920,
    maxHeight = 1920,
    outputFormat = 'image/jpeg',
  } = options;

  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calcular dimensiones manteniendo aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen escalada
      ctx.drawImage(img, 0, 0, width, height);

      // Convertir a blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: outputFormat,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Canvas toBlob failed'));
          }
        },
        outputFormat,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Detectar si el navegador soporta WebP
 * @returns {Promise<boolean>} - true si soporta WebP
 */
export const supportsWebP = () => {
  return new Promise((resolve) => {
    const webP = new Image();
    webP.onload = webP.onerror = () => {
      resolve(webP.height === 2);
    };
    webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
  });
};

/**
 * Detectar si el navegador soporta AVIF
 * @returns {Promise<boolean>} - true si soporta AVIF
 */
export const supportsAVIF = () => {
  return new Promise((resolve) => {
    const avif = new Image();
    avif.onload = avif.onerror = () => {
      resolve(avif.height === 2);
    };
    avif.src = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgABogQEAwgMg8f8D///8WfhwB8+ErK42A=';
  });
};

/**
 * Obtener el mejor formato de imagen soportado
 * @returns {Promise<string>} - Formato óptimo (avif, webp, jpeg)
 */
export const getBestImageFormat = async () => {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpeg';
};

/**
 * Crear URL de imagen optimizada
 * @param {string} baseUrl - URL base
 * @param {object} options - Opciones de optimización
 * @returns {Promise<string>} - URL optimizada
 */
export const createOptimizedImageUrl = async (baseUrl, options = {}) => {
  const {
    width,
    height,
    quality = 80,
    fit = 'cover',
    auto = true,
  } = options;

  const params = new URLSearchParams();
  
  if (width) params.append('w', width);
  if (height) params.append('h', height);
  if (quality !== 80) params.append('q', quality);
  if (fit !== 'cover') params.append('fit', fit);
  
  if (auto) {
    const format = await getBestImageFormat();
    params.append('format', format);
  }

  return `${baseUrl}?${params.toString()}`;
};

/**
 * Dimensiones de imagen para diferentes breakpoints
 */
export const RESPONSIVE_BREAKPOINTS = {
  mobile: { width: 480, sizes: '(max-width: 480px) 100vw' },
  tablet: { width: 768, sizes: '(max-width: 768px) 100vw' },
  desktop: { width: 1200, sizes: '(max-width: 1200px) 100vw' },
  large: { width: 1600, sizes: '100vw' },
};

/**
 * Generar picture element con fuentes optimizadas
 * @param {string} src - URL base de la imagen
 * @param {string} alt - Texto alternativo
 * @param {object} options - Opciones de configuración
 * @returns {object} - Props para el elemento picture
 */
export const generatePictureProps = async (src, alt, options = {}) => {
  const {
    breakpoints = RESPONSIVE_BREAKPOINTS,
    lazy = true,
    priority = false,
  } = options;

  const sources = [];
  const formats = ['avif', 'webp', 'jpeg'];

  // Verificar soporte de formatos
  const supportedFormats = [];
  if (await supportsAVIF()) supportedFormats.push('avif');
  if (await supportsWebP()) supportedFormats.push('webp');
  supportedFormats.push('jpeg');

  // Generar sources para diferentes formatos y breakpoints
  for (const format of supportedFormats) {
    const srcSet = Object.values(breakpoints)
      .map(({ width }) => `${src}?w=${width}&format=${format} ${width}w`)
      .join(', ');

    sources.push({
      type: `image/${format}`,
      srcSet,
      sizes: Object.values(breakpoints)
        .map(({ sizes }) => sizes)
        .join(', '),
    });
  }

  return {
    sources,
    img: {
      src: `${src}?w=${breakpoints.desktop.width}&format=jpeg`,
      alt,
      loading: lazy && !priority ? 'lazy' : 'eager',
      decoding: priority ? 'sync' : 'async',
    },
  };
};

/**
 * Monitor de performance de imágenes
 */
export class ImagePerformanceMonitor {
  constructor() {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
      largestContentfulPaint: 0,
    };
    
    this.observers = {
      performance: null,
      intersection: null,
    };
    
    this.init();
  }

  init() {
    // Observer para LCP
    if ('PerformanceObserver' in window) {
      this.observers.performance = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lcpEntry = entries[entries.length - 1];
        
        if (lcpEntry.element && lcpEntry.element.tagName === 'IMG') {
          this.metrics.largestContentfulPaint = lcpEntry.startTime;
        }
      });
      
      this.observers.performance.observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  trackImageLoad(url, startTime, endTime, success = true) {
    this.metrics.totalImages++;
    
    if (success) {
      this.metrics.loadedImages++;
      const loadTime = endTime - startTime;
      this.metrics.totalLoadTime += loadTime;
      this.metrics.averageLoadTime = this.metrics.totalLoadTime / this.metrics.loadedImages;
    } else {
      this.metrics.failedImages++;
    }
  }

  getMetrics() {
    return {
      ...this.metrics,
      successRate: this.metrics.totalImages > 0 
        ? (this.metrics.loadedImages / this.metrics.totalImages) * 100 
        : 0,
    };
  }

  reset() {
    this.metrics = {
      totalImages: 0,
      loadedImages: 0,
      failedImages: 0,
      totalLoadTime: 0,
      averageLoadTime: 0,
      largestContentfulPaint: 0,
    };
  }

  destroy() {
    if (this.observers.performance) {
      this.observers.performance.disconnect();
    }
    if (this.observers.intersection) {
      this.observers.intersection.disconnect();
    }
  }
}

// Instancia global del monitor
export const imagePerformanceMonitor = new ImagePerformanceMonitor(); 