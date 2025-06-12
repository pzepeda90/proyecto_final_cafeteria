#!/bin/bash

# Script de inicio rápido para el sistema POS de Cafetería L'Bandito
echo "🚀 Iniciando Sistema POS - Cafetería L'Bandito"
echo "=============================================="

# Función para verificar si un puerto está en uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Puerto $1 ya está en uso"
        return 1
    else
        echo "✅ Puerto $1 disponible"
        return 0
    fi
}

# Verificar puertos
echo "📡 Verificando puertos..."
check_port 3000
backend_available=$?
check_port 5174
frontend_available=$?

# Detener procesos existentes si es necesario
if [ $backend_available -eq 1 ]; then
    echo "🔄 Deteniendo proceso en puerto 3000..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

if [ $frontend_available -eq 1 ]; then
    echo "🔄 Deteniendo proceso en puerto 5174..."
    lsof -ti:5174 | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# Iniciar backend
echo "🔧 Iniciando backend..."
cd backend
DB_HOST=localhost \
DB_PORT=5432 \
DB_NAME=cafeteria_l_bandito \
DB_USER=patriciozepeda \
DB_PASS=123456 \
PORT=3000 \
JWT_SECRET=tu_jwt_secret_muy_seguro_aqui_123456789 \
CORS_ORIGIN=http://localhost:5174 \
NODE_ENV=development \
node src/index.js &

BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

# Esperar a que el backend esté listo
echo "⏳ Esperando que el backend esté listo..."
sleep 5

# Verificar que el backend responda
if curl -s http://localhost:3000/api/productos > /dev/null; then
    echo "✅ Backend funcionando correctamente"
else
    echo "❌ Error: Backend no responde"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Iniciar frontend
echo "🎨 Iniciando frontend..."
cd ../frontend
npm run dev &

FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

# Mostrar información del sistema
echo ""
echo "🎉 Sistema POS iniciado exitosamente!"
echo "=============================================="
echo "📱 Frontend: http://localhost:5174"
echo "🔧 Backend API: http://localhost:3000"
echo "📚 Swagger Docs: http://localhost:3000/api-docs"
echo ""
echo "👤 Credenciales de prueba:"
echo "   Vendedor: vendedor@cafeteria.com / password123"
echo "   Admin: admin@cafeteria.com / admin123"
echo ""
echo "🛑 Para detener el sistema: Ctrl+C"
echo ""

# Función para limpiar procesos al salir
cleanup() {
    echo ""
    echo "🛑 Deteniendo sistema..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ Sistema detenido"
    exit 0
}

# Capturar señal de interrupción
trap cleanup INT

# Mantener el script corriendo
wait 