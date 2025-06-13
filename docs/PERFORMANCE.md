# 🚀 Optimizaciones de Performance

Este documento describe todas las optimizaciones de performance implementadas en el proyecto de Cafetería El Bandito.

## 📊 Métricas Objetivo

### Core Web Vitals
- **LCP (Largest Contentful Paint)**: < 2.5 segundos
- **FID (First Input Delay)**: < 100 ms
- **CLS (Cumulative Layout Shift)**: < 0.1
- **FCP (First Contentful Paint)**: < 2.0 segundos
- **TTI (Time to Interactive)**: < 3.0 segundos

### Lighthouse Scores
- **Performance**: > 80%
- **Accessibility**: > 90%
- **Best Practices**: > 90%
- **SEO**: > 90%

## 🎯 Frontend Optimizations

### 1. Bundle Optimization (Vite)

#### Code Splitting
- **Vendor chunks**: React, Router, Redux separados
- **Feature chunks**: Charts, UI components, HTTP utils
- **Manual chunking**: Optimización específica por biblioteca
- **Tree shaking**: Eliminación automática de código no utilizado

```javascript
// vite.config.js
manualChunks: {
  react: ['react', 'react-dom'],
  router: ['react-router-dom'],
  redux: ['@reduxjs/toolkit', 'react-redux'],
  ui: ['@headlessui/react'],
  charts: ['recharts'],
  http: ['axios'],
  alerts: ['sweetalert2'],
}
```

#### Build Optimizations
- **Terser**: Minificación avanzada con eliminación de console.log
- **CSS Code Splitting**: CSS separado por chunks
- **Asset optimization**: Nombres con hash para cache
- **Compression**: Gzip/Brotli automático

### 2. Image Optimization

#### Lazy Loading
- **Intersection Observer**: Carga solo cuando es visible
- **Progressive loading**: Placeholder → Imagen optimizada
- **Error handling**: Fallbacks para imágenes fallidas

#### Format Optimization
- **AVIF/WebP**: Formatos modernos con fallback a JPEG
- **Responsive images**: srcSet para diferentes tamaños
- **Compression**: Calidad optimizada por uso

```javascript
// Detección automática de formato
const getBestImageFormat = async () => {
  if (await supportsAVIF()) return 'avif';
  if (await supportsWebP()) return 'webp';
  return 'jpeg';
};
```

### 3. React Performance

#### Memoization
- **React.memo**: Componentes memoizados
- **useMemo**: Cálculos costosos cacheados
- **useCallback**: Callbacks estables

```javascript
const OptimizedComponent = memo(({ data }) => {
  const expensiveValue = useMemo(() => {
    return processData(data);
  }, [data]);
  
  const handleClick = useCallback(() => {
    // Handle click
  }, []);
  
  return <div>{expensiveValue}</div>;
});
```

#### Virtual Scrolling
- **Viewport-based rendering**: Solo elementos visibles
- **Overscan**: Buffer para scroll suave
- **Dynamic heights**: Soporte para elementos de altura variable

### 4. API Optimization

#### Caching Strategy
- **Memory cache**: 5 minutos para requests frecuentes
- **Deduplication**: Evitar requests duplicados
- **Invalidation**: Cache inteligente por patrones

```javascript
const { optimizedRequest } = useApiOptimization();

// Request con cache automático
const data = await optimizedRequest(
  () => api.getProducts(params),
  createCacheKey('products', params),
  { useCache: true, timeout: 10000 }
);
```

#### Debouncing & Throttling
- **Search debouncing**: 300ms delay para búsquedas
- **Scroll throttling**: Optimización de eventos de scroll
- **Input optimization**: Reducción de renders innecesarios

### 5. Network Optimization

#### HTTP/2 & Preloading
- **Resource hints**: dns-prefetch, preconnect
- **Critical resource preloading**: CSS y fonts críticos
- **Module preloading**: JavaScript chunks importantes

#### Service Workers (Futuro)
- **Cache strategies**: Network-first para API, Cache-first para assets
- **Background sync**: Sincronización offline
- **Push notifications**: Optimizado para engagement

## ⚡ Backend Optimizations

### 1. Server Configuration

#### Compression
- **Gzip/Brotli**: Compresión automática > 1KB
- **Level 6**: Balance entre velocidad y ratio
- **Content filtering**: Solo contenido compresible

#### Rate Limiting
- **Redis-backed**: Límites distribuidos
- **Endpoint-specific**: Límites por tipo de operación
- **Graduated responses**: Diferentes límites por criticidad

### 2. Caching Strategy

#### Redis Implementation
- **Response caching**: GET requests con TTL inteligente
- **Pattern invalidation**: Cache invalidation por patrones
- **Graceful degradation**: Funcionamiento sin Redis

```javascript
// Cache con diferentes TTL por tipo
app.use('/api/productos', cacheMiddleware(300)); // 5 min
app.use('/api/categorias', cacheMiddleware(1800)); // 30 min
app.use('/api/roles', cacheMiddleware(3600)); // 1 hora
```

#### Cache Headers
- **ETags**: Validación de cache del navegador
- **Cache-Control**: Directivas específicas por endpoint
- **Vary headers**: Cache por headers específicos

### 3. Database Optimization

#### Query Optimization
- **Índices estratégicos**: Campos frecuentemente consultados
- **LIMIT clauses**: Paginación obligatoria
- **Eager loading**: Reducción de N+1 queries

#### Connection Pooling
- **Pool size**: Optimizado para carga esperada
- **Timeout configuration**: Evitar conexiones colgadas
- **Health checks**: Monitoreo de conexiones

### 4. Monitoring & Observability

#### Performance Metrics
- **Response time tracking**: Logging de requests lentos
- **Memory monitoring**: Alertas por uso excesivo
- **Error rate tracking**: Monitoreo de errores por endpoint

```javascript
// Middleware de performance
app.use((req, res, next) => {
  const start = performance.now();
  
  res.on('finish', () => {
    const duration = performance.now() - start;
    if (duration > 1000) {
      console.warn(`🐌 Slow request: ${req.method} ${req.url} - ${duration}ms`);
    }
  });
  
  next();
});
```

## 📈 Performance Testing

### 1. Automated Testing

#### Lighthouse CI
```bash
npm run perf:lighthouse
```
- **Multiple pages**: Home, Products, About, Contact
- **Desktop configuration**: Simula conexión rápida
- **Assertions**: Fallar si performance < 80%

#### Bundle Analysis
```bash
npm run build:analyze
```
- **Bundle visualizer**: Análisis interactivo de chunks
- **Size tracking**: Alertas por bundles grandes
- **Dependency analysis**: Identificar imports costosos

### 2. Manual Testing

#### Performance Tools
- **Chrome DevTools**: Performance tab para profiling
- **Network tab**: Análisis de waterfall
- **Lighthouse**: Auditorías manuales

#### Load Testing
- **Artillery/k6**: Tests de carga para API
- **Stress testing**: Identificar puntos de ruptura
- **Memory leak detection**: Profiling de memoria

## 🎯 Performance Budgets

### JavaScript
- **Initial bundle**: < 200KB gzipped
- **Total JavaScript**: < 500KB gzipped
- **Third-party**: < 100KB gzipped

### Images
- **Critical images**: < 50KB cada una
- **Total images per page**: < 1MB
- **Format requirement**: WebP/AVIF cuando sea posible

### Fonts
- **Font files**: < 100KB total
- **Font display**: swap para evitar FOIT
- **Preload**: Fonts críticos

## 📊 Monitoring en Producción

### 1. Real User Monitoring (RUM)

#### Core Web Vitals Tracking
```javascript
// Performance API integration
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    // Send metrics to analytics
    analytics.track('core-web-vital', {
      name: entry.name,
      value: entry.value,
      rating: entry.rating,
    });
  }
});

observer.observe({entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift']});
```

#### Error Tracking
- **JavaScript errors**: Captura automática
- **Network errors**: Failed requests tracking
- **Performance errors**: Slow operations detection

### 2. Server Monitoring

#### Health Endpoints
- **`/health`**: Health check básico
- **`/metrics`**: Métricas detalladas de performance
- **Uptime monitoring**: Alertas automáticas

#### Log Analysis
- **Structured logging**: JSON format para análisis
- **Performance logs**: Request timing tracking
- **Error aggregation**: Agrupar errores similares

## 🚀 Deployment Optimizations

### 1. CDN Configuration

#### Static Assets
- **Edge caching**: Assets estáticos en CDN
- **Cache headers**: Long-term caching para assets versionados
- **Compression**: Gzip/Brotli en edge

#### API Caching
- **Edge caching**: Responses cacheables en CDN
- **Purge strategies**: Invalidación automática
- **Geographic distribution**: Reducir latencia global

### 2. Server Optimization

#### Container Optimization
- **Multi-stage builds**: Imágenes Docker optimizadas
- **Resource limits**: CPU/Memory constraints
- **Health checks**: Restart automático en problemas

#### Load Balancing
- **Horizontal scaling**: Multiple instances
- **Session affinity**: Sticky sessions si necesario
- **Circuit breakers**: Protección contra cascading failures

## 📋 Performance Checklist

### Pre-deployment
- [ ] Bundle analysis ejecutado
- [ ] Lighthouse CI pasando
- [ ] Performance tests ejecutados
- [ ] Cache invalidation probado
- [ ] Error handling verificado

### Post-deployment
- [ ] Core Web Vitals monitoreados
- [ ] CDN functioning verificado
- [ ] Database performance normal
- [ ] Error rates normales
- [ ] User experience metrics tracking

## 🔧 Herramientas de Debug

### Frontend
```bash
# Análisis de bundle
npm run build:analyze

# Performance profiling
npm run dev # + Chrome DevTools Performance tab

# Lighthouse audit
npm run perf:lighthouse
```

### Backend
```bash
# Load testing
artillery run load-test.yml

# Memory profiling
node --inspect src/index.js

# Performance monitoring
curl http://localhost:3000/metrics
```

## 📚 Recursos Adicionales

### Documentación
- [Web Performance](https://web.dev/performance/)
- [Core Web Vitals](https://web.dev/vitals/)
- [React Performance](https://react.dev/learn/render-and-commit#optimizing-performance)

### Tools
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [WebPageTest](https://www.webpagetest.org/)
- [Bundle Analyzer](https://github.com/webpack-contrib/webpack-bundle-analyzer)

---

Este documento debe mantenerse actualizado con nuevas optimizaciones y cambios en las métricas objetivo. 