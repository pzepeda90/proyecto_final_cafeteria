# =====================================================
# DOCKERFILE PARA BACKEND - CAFETERÍA L'BANDITO
# =====================================================

# Usar imagen oficial de Node.js LTS
FROM node:18-alpine AS base

# Instalar dependencias del sistema
RUN apk add --no-cache \
    dumb-init \
    && addgroup -g 1001 -S nodejs \
    && adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# =====================================================
# STAGE 1: DEPENDENCIAS
# =====================================================
FROM base AS deps

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# =====================================================
# STAGE 2: BUILD
# =====================================================
FROM base AS build

# Instalar todas las dependencias (incluyendo dev)
RUN npm ci

# Copiar código fuente
COPY . .

# Ejecutar linting y tests (opcional)
# RUN npm run lint
# RUN npm run test

# =====================================================
# STAGE 3: PRODUCCIÓN
# =====================================================
FROM base AS production

# Configurar variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Copiar dependencias de producción
COPY --from=deps --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código fuente
COPY --chown=nodejs:nodejs . .

# Crear directorio para logs
RUN mkdir -p /app/logs && chown nodejs:nodejs /app/logs

# Cambiar a usuario no-root
USER nodejs

# Exponer puerto
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Comando de inicio con dumb-init para manejo de señales
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "src/index.js"] 