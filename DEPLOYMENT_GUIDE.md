# 🚀 GUÍA DE DEPLOYMENT - HITO 4

## 📋 **OBJETIVO**: Desplegar aplicación completa en producción (10 puntos)

### **🎯 PLAN DE DEPLOYMENT**
1. **Base de datos** → Render PostgreSQL (2 puntos)
2. **Backend API** → Render Web Service (2 puntos)  
3. **Frontend** → Netlify (2 puntos)
4. **Integración completa** → Conectar todo (4 puntos)

---

## 🗃️ **PASO 1: DEPLOY DE BASE DE DATOS (2 puntos)**

### **📊 Opción A: Render PostgreSQL (RECOMENDADO - GRATIS)**

1. **Ir a Render.com**
   - Crear cuenta gratis
   - Click en "New +" → "PostgreSQL"

2. **Configurar base de datos**
   ```
   Name: cafeteria-lbandito-db
   Database: cafeteria_prod
   User: cafeteria_user
   Region: Oregon (US West)
   PostgreSQL Version: 15
   Plan: Free ($0/month)
   ```

3. **Obtener credenciales**
   ```
   Host: xxx.oregon-postgres.render.com
   Port: 5432
   Database: cafeteria_prod
   Username: cafeteria_user
   Password: [generado automáticamente]
   Connection String: postgresql://cafeteria_user:xxx@xxx.oregon-postgres.render.com/cafeteria_prod
   ```

4. **Ejecutar migraciones**
   ```bash
   # Conectarse a la BD de producción y ejecutar:
   # El script database_setup.sql desde tu proyecto
   ```

### **📊 Opción B: Supabase (ALTERNATIVA)**
- Crear proyecto en supabase.com
- Obtener connection string
- Ejecutar migraciones

---

## ⚙️ **PASO 2: DEPLOY DE BACKEND (2 puntos)**

### **🔧 Render Web Service**

1. **Preparar repositorio**
   ```bash
   # Asegúrate de tener todo en GitHub
   git add .
   git commit -m "Preparar para production deploy"
   git push origin main
   ```

2. **Crear Web Service en Render**
   - New + → Web Service
   - Connect GitHub repository
   - Branch: main
   - Root Directory: backend

3. **Configurar build settings**
   ```
   Build Command: npm install
   Start Command: npm start
   
   # En package.json del backend debe tener:
   "scripts": {
     "start": "node src/index.js"
   }
   ```

4. **Variables de entorno en Render**
   ```
   DATABASE_URL=postgresql://[tu_connection_string_de_render]
   JWT_SECRET=mi_super_secreto_jwt_para_produccion_2024
   NODE_ENV=production
   FRONTEND_URL=https://[tu-frontend].netlify.app
   PORT=3000
   ```

5. **Deploy automático**
   - Render construirá y desplegará automáticamente
   - URL final: https://tu-backend.onrender.com

---

## 🖥️ **PASO 3: DEPLOY DE FRONTEND (2 puntos)**

### **🎨 Netlify (RECOMENDADO)**

1. **Preparar build de producción**
   ```bash
   cd frontend
   
   # Crear .env.production
   echo "VITE_API_URL=https://tu-backend.onrender.com/api" > .env.production
   
   # Build para producción
   npm run build
   ```

2. **Deploy en Netlify**
   
   **Opción A: Drag & Drop**
   - Ir a netlify.com
   - Arrastrar carpeta `frontend/dist` al dashboard
   
   **Opción B: GitHub (Recomendado)**
   - New site from Git
   - Connect GitHub
   - Build settings:
     ```
     Base directory: frontend
     Build command: npm run build
     Publish directory: frontend/dist
     ```

3. **Variables de entorno en Netlify**
   ```
   VITE_API_URL=https://tu-backend.onrender.com/api
   ```

4. **URL final**: https://tu-app.netlify.app

---

## 🔗 **PASO 4: INTEGRACIÓN COMPLETA (4 puntos)**

### **🔧 Configurar CORS en Backend**

```javascript
// backend/src/index.js - Actualizar CORS
app.use(cors({
  origin: [
    'http://localhost:5174',
    'https://tu-app.netlify.app'  // ← Agregar URL de producción
  ],
  credentials: true
}));
```

### **🔧 Actualizar URLs en Frontend**

```javascript
// frontend/src/services/api.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
```

### **✅ Verificar integración**

1. **Abrir frontend en producción**
2. **Probar funcionalidades:**
   - ✅ Login/registro
   - ✅ Crear productos
   - ✅ Sistema POS
   - ✅ Dashboard
   - ✅ Persistencia de datos

---

## 🧪 **PASO 5: TESTING EN PRODUCCIÓN**

### **📋 Checklist de funcionalidades**

```
□ Frontend carga correctamente
□ Backend responde en /api/
□ Base de datos conectada
□ Login/registro funciona
□ CRUD de productos funciona
□ Sistema POS funciona
□ Dashboard muestra datos
□ Datos persisten entre sesiones
□ No hay errores en console
□ APIs responden correctamente
```

---

## 📱 **URLS FINALES PARA ENTREGAR**

```
🌐 Frontend: https://cafeteria-lbandito.netlify.app
🔧 Backend: https://cafeteria-lbandito-api.onrender.com
📊 API Docs: https://cafeteria-lbandito-api.onrender.com/api-docs
💾 Database: [Internal - Render PostgreSQL]
```

---

## 🐛 **TROUBLESHOOTING COMÚN**

### **❌ Frontend no conecta con Backend**
```bash
# Verificar CORS en backend
# Verificar VITE_API_URL en frontend
# Verificar que backend esté desplegado
```

### **❌ Backend no conecta con BD**
```bash
# Verificar DATABASE_URL en variables de entorno
# Verificar que BD esté desplegada
# Ejecutar migraciones en BD de producción
```

### **❌ Build falla**
```bash
# Verificar que package.json tenga script "start"
# Verificar dependencias de producción
# Verificar Node.js version compatibility
```

---

## 🎯 **CRITERIOS DE EVALUACIÓN**

### **✅ Para obtener los 10 puntos:**

1. **Deploy Frontend (2 pts)**: App accesible via HTTPS ✅
2. **Deploy Backend (2 pts)**: API funcional via HTTPS ✅
3. **Deploy Database (2 pts)**: Datos persisten correctamente ✅
4. **Integración (4 pts)**: Todo funciona end-to-end ✅

### **🏆 Extras que impresionan:**
- ✅ HTTPS habilitado
- ✅ Variables de entorno bien configuradas
- ✅ No hay errores en console
- ✅ Performance optimizada
- ✅ URLs amigables

---

## ⏰ **TIMELINE RECOMENDADO**

```
🕐 Hora 1: Deploy de base de datos
🕑 Hora 2: Deploy de backend  
🕒 Hora 3: Deploy de frontend
🕓 Hora 4: Integración y testing
```

**Total: ~4 horas para deployment completo**

---

## 🎉 **RESULTADO FINAL**

**Link para entregar**: https://cafeteria-lbandito.netlify.app

**Funcionalidades verificadas:**
- ✅ Sistema POS completo
- ✅ Gestión de productos
- ✅ Dashboard administrativo
- ✅ Autenticación de usuarios
- ✅ Persistencia de datos

¡**TU PROYECTO ESTARÁ EN PRODUCCIÓN Y LISTO PARA EVALUACIÓN!** 