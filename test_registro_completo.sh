#!/bin/bash

echo "🧪 Probando sistema de registro completo..."

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URL base del API
API_URL="http://localhost:3000/api"

echo -e "${YELLOW}📋 Probando registro de usuario...${NC}"

# Test 1: Registro de usuario
echo "Test 1: Registro de usuario con todos los campos"
curl -X POST "$API_URL/usuarios/registro" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@test.com",
    "password": "password123",
    "telefono": "+56912345678",
    "fecha_nacimiento": null
  }' | jq '.'

echo -e "\n${YELLOW}📋 Probando registro de vendedor...${NC}"

# Primero necesitamos un token de admin
echo "Obteniendo token de admin..."
ADMIN_TOKEN=$(curl -s -X POST "$API_URL/usuarios/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@cafeteria.com",
    "password": "password123"
  }' | jq -r '.token')

if [ "$ADMIN_TOKEN" != "null" ] && [ "$ADMIN_TOKEN" != "" ]; then
  echo -e "${GREEN}✅ Token de admin obtenido${NC}"
  
  # Test 2: Registro de vendedor
  echo "Test 2: Registro de vendedor"
  curl -X POST "$API_URL/vendedores" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
      "nombre": "María",
      "apellido": "González",
      "email": "maria.gonzalez@cafeteria.com",
      "password": "password123",
      "telefono": "+56987654321"
    }' | jq '.'
else
  echo -e "${RED}❌ No se pudo obtener token de admin${NC}"
fi

echo -e "\n${YELLOW}📋 Probando endpoints básicos...${NC}"

# Test 3: Verificar productos
echo "Test 3: Obtener productos"
curl -s "$API_URL/productos" | jq '. | length'

# Test 4: Verificar mesas disponibles
echo "Test 4: Obtener mesas disponibles"
curl -s "$API_URL/mesas/disponibles" | jq '. | length'

echo -e "\n${GREEN}🎉 Pruebas completadas${NC}" 