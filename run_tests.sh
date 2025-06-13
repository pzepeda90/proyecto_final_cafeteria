#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Ejecutando tests del Frontend...${NC}"
cd frontend
npm test -- --coverage
FRONTEND_EXIT_CODE=$?

echo -e "\n${GREEN}Ejecutando tests del Backend...${NC}"
cd ../backend
npm test
BACKEND_EXIT_CODE=$?

# Verificar si algún test falló
if [ $FRONTEND_EXIT_CODE -ne 0 ] || [ $BACKEND_EXIT_CODE -ne 0 ]; then
    echo -e "\n${RED}❌ Algunos tests han fallado${NC}"
    exit 1
else
    echo -e "\n${GREEN}✅ Todos los tests han pasado exitosamente${NC}"
    
    # Mostrar resumen de cobertura
    echo -e "\n${GREEN}Resumen de Cobertura:${NC}"
    echo "Frontend: Ver ./frontend/coverage/lcov-report/index.html"
    echo "Backend: Ver ./backend/coverage/lcov-report/index.html"
fi 