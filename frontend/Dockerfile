# =====================================================
# DOCKERFILE PARA FRONTEND - CAFETERÍA L'BANDITO
# =====================================================

# =====================================================
# STAGE 1: BUILD
# =====================================================
FROM node:18-alpine AS build

# Instalar dependencias del sistema
RUN apk add --no-cache git

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci --silent

# Copiar código fuente
COPY . .

# Variables de entorno para build
ARG VITE_API_BASE_URL=http://localhost:3000/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Construir aplicación para producción
RUN npm run build

# =====================================================
# STAGE 2: PRODUCCIÓN CON NGINX
# =====================================================
FROM nginx:alpine AS production

# Instalar dependencias adicionales
RUN apk add --no-cache curl

# Copiar configuración personalizada de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar archivos construidos desde stage anterior
COPY --from=build /app/dist /usr/share/nginx/html

# Crear usuario no-root
RUN addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Configurar permisos
RUN chown -R nodejs:nodejs /usr/share/nginx/html \
    && chown -R nodejs:nodejs /var/cache/nginx \
    && chown -R nodejs:nodejs /var/log/nginx \
    && chown -R nodejs:nodejs /etc/nginx/conf.d \
    && touch /var/run/nginx.pid \
    && chown -R nodejs:nodejs /var/run/nginx.pid

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"] 