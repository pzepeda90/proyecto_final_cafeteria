#!/bin/bash

echo "🚀 Iniciando Cafetería L'Bandito en modo desarrollo..."

# Función para matar procesos al salir
cleanup() {
    echo "🛑 Deteniendo servicios..."
    pkill -f "nodemon src/index.js" 2>/dev/null || true
    pkill -f "vite" 2>/dev/null || true
    exit 0
}

# Configurar trap para cleanup
trap cleanup SIGINT SIGTERM

# Verificar que PostgreSQL esté ejecutándose
if ! pg_isready -h localhost -p 5432 -U patriciozepeda >/dev/null 2>&1; then
    echo "❌ PostgreSQL no está ejecutándose. Inicia PostgreSQL primero."
    exit 1
fi

echo "✅ PostgreSQL está ejecutándose"

# Iniciar backend en background
echo "🔧 Iniciando backend..."
cd backend
npm run dev &
BACKEND_PID=$!

# Esperar un momento para que el backend inicie
sleep 3

# Iniciar frontend en background
echo "⚛️ Iniciando frontend..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!

echo ""
echo "🎉 ¡Servicios iniciados!"
echo "📱 Frontend: http://localhost:5174"
echo "🔧 Backend: http://localhost:3000"
echo "📚 API Docs: http://localhost:3000/api-docs"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Esperar a que terminen los procesos
wait $BACKEND_PID $FRONTEND_PID
