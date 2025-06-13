# 👨‍💻 Guía de Desarrollo

Esta guía está dirigida a desarrolladores que quieren contribuir al Sistema de Gestión de Cafetería L'Bandito.

## 📋 Tabla de Contenidos

- [Configuración del Entorno](#-configuración-del-entorno)
- [Arquitectura del Proyecto](#-arquitectura-del-proyecto)
- [Estándares de Código](#-estándares-de-código)
- [Flujo de Desarrollo](#-flujo-de-desarrollo)
- [Testing](#-testing)
- [Base de Datos](#-base-de-datos)
- [API Guidelines](#-api-guidelines)
- [Frontend Guidelines](#-frontend-guidelines)
- [Performance](#-performance)
- [Seguridad](#-seguridad)
- [Deployment](#-deployment)

## 🛠️ Configuración del Entorno

### IDEs y Extensions Recomendadas

#### Visual Studio Code
```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "ms-vscode-remote.remote-containers",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-eslint",
    "pflannery.vscode-versionlens"
  ]
}
```

#### Settings.json recomendado
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "javascript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "javascript": "javascript",
    "html": "HTML"
  }
}
```

### Scripts de Desarrollo

#### Backend
```bash
# Desarrollo
npm run dev              # Nodemon con recarga automática
npm run dev:debug        # Con debugging habilitado
npm run dev:watch        # Con file watching

# Base de datos
npm run db:migrate       # Ejecutar migraciones
npm run db:seed          # Insertar datos de prueba
npm run db:reset         # Reset completo
npm run db:backup        # Backup de BD

# Testing
npm run test             # Tests unitarios
npm run test:watch       # Tests en modo watch
npm run test:e2e         # Tests end-to-end
npm run test:coverage    # Reporte de coverage

# Calidad de código
npm run lint             # ESLint
npm run lint:fix         # Auto-fix ESLint
npm run format           # Prettier
npm run type-check       # TypeScript checking
```

#### Frontend
```bash
# Desarrollo
npm run dev              # Vite dev server
npm run dev:host         # Exponer en red local
npm run dev:debug        # Con debugging

# Build y preview
npm run build            # Build de producción
npm run preview          # Preview del build
npm run analyze          # Análisis del bundle

# Testing
npm run test             # Jest + React Testing Library
npm run test:watch       # Tests en modo watch
npm run test:e2e         # Cypress E2E tests
npm run test:coverage    # Coverage report

# Calidad de código
npm run lint             # ESLint
npm run lint:fix         # Auto-fix ESLint
npm run format           # Prettier
npm run type-check       # TypeScript checking
```

## 🏗️ Arquitectura del Proyecto

### Backend Architecture

```
backend/src/
├── 📁 controllers/          # Controladores HTTP
│   ├── auth.controller.js
│   ├── users.controller.js
│   └── products.controller.js
├── 📁 services/             # Lógica de negocio
│   ├── auth.service.js
│   ├── user.service.js
│   └── product.service.js
├── 📁 models/               # Modelos de datos
│   ├── User.js
│   ├── Product.js
│   └── index.js
├── 📁 routes/               # Definición de rutas
│   ├── auth.routes.js
│   ├── users.routes.js
│   └── api.routes.js
├── 📁 middlewares/          # Middlewares
│   ├── auth.middleware.js
│   ├── validation.middleware.js
│   └── error.middleware.js
├── 📁 config/               # Configuraciones
│   ├── database.js
│   ├── redis.js
│   └── swagger.js
├── 📁 utils/                # Utilidades
│   ├── logger.js
│   ├── helpers.js
│   └── constants.js
├── 📁 migrations/           # Migraciones de BD
├── 📁 seeders/              # Datos de prueba
└── 📄 index.js              # Entry point
```

### Frontend Architecture

```
frontend/src/
├── 📁 components/           # Componentes reutilizables
│   ├── 📁 ui/              # Componentes base (Button, Input, etc.)
│   ├── 📁 layout/          # Layout components (Header, Footer, etc.)
│   ├── 📁 features/        # Feature-specific components
│   └── 📁 forms/           # Form components
├── 📁 pages/                # Page components
│   ├── 📁 auth/            # Authentication pages
│   ├── 📁 admin/           # Admin pages
│   └── 📁 client/          # Client pages
├── 📁 hooks/                # Custom React hooks
├── 📁 services/             # API services
├── 📁 store/                # Redux store
│   ├── 📁 slices/          # Redux slices
│   └── 📄 index.js         # Store configuration
├── 📁 utils/                # Utility functions
├── 📁 constants/            # Constants and configs
├── 📁 assets/               # Static assets
└── 📁 styles/               # Global styles
```

### Design Patterns Utilizados

#### Backend
- **MVC Pattern**: Model-View-Controller separation
- **Service Layer**: Business logic abstraction
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Request/response interceptors
- **Dependency Injection**: Service dependencies

#### Frontend
- **Component-Based**: Reusable UI components
- **Redux Pattern**: Predictable state management
- **Custom Hooks**: Reusable stateful logic
- **Compound Components**: Complex UI patterns
- **Higher-Order Components**: Component enhancement

## 📝 Estándares de Código

### Naming Conventions

#### Variables y Funciones
```javascript
// ✅ Correcto - camelCase
const userName = 'patricio';
const calculateTotal = () => {};
const isUserAuthenticated = true;

// ❌ Incorrecto
const user_name = 'patricio';
const IsUserAuthenticated = true;
```

#### Componentes React
```javascript
// ✅ Correcto - PascalCase
const UserProfile = () => {};
const ProductCard = () => {};

// ❌ Incorrecto
const userProfile = () => {};
const productcard = () => {};
```

#### Archivos
```bash
# ✅ Correcto
UserProfile.jsx
user.service.js
auth.middleware.js

# ❌ Incorrecto
userprofile.jsx
UserService.js
authMiddleware.js
```

#### Constantes
```javascript
// ✅ Correcto - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000';
const MAX_FILE_SIZE = 5242880;
const USER_ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor',
  CLIENTE: 'cliente'
};
```

### Code Style Guidelines

#### ESLint Configuration
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "airbnb",
    "prettier"
  ],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "warn",
    "no-console": "warn",
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

#### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
```

### Commit Messages

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
# Estructura
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Ejemplos
feat(auth): add password reset functionality
fix(api): resolve user registration validation
docs(readme): update installation instructions
style(frontend): fix eslint warnings
refactor(backend): optimize database queries
test(auth): add unit tests for login service
chore(deps): update dependencies
```

#### Tipos de Commit
- **feat**: Nueva funcionalidad
- **fix**: Corrección de bugs
- **docs**: Documentación
- **style**: Formateo, espacios, etc.
- **refactor**: Refactoring de código
- **test**: Agregar o modificar tests
- **chore**: Tareas de mantenimiento

## 🔄 Flujo de Desarrollo

### Git Workflow

#### 1. Crear Feature Branch
```bash
# Actualizar main
git checkout main
git pull origin main

# Crear nueva rama
git checkout -b feature/user-authentication
```

#### 2. Desarrollo
```bash
# Commits frecuentes y pequeños
git add .
git commit -m "feat(auth): add login form validation"

# Push de la rama
git push origin feature/user-authentication
```

#### 3. Pull Request
1. Crear PR en GitHub
2. Agregar descripción detallada
3. Asignar reviewers
4. Esperar aprobación
5. Merge a main

### Branches Strategy

```
main                    # Producción
├── develop            # Desarrollo
├── feature/auth       # Nueva funcionalidad
├── bugfix/login-fix   # Corrección de bugs
└── hotfix/security    # Hotfixes críticos
```

### Code Review Checklist

#### Reviewer Checklist
- [ ] ¿El código sigue los estándares del proyecto?
- [ ] ¿Hay tests para el nuevo código?
- [ ] ¿La documentación está actualizada?
- [ ] ¿No hay console.log en producción?
- [ ] ¿Las funciones tienen nombres descriptivos?
- [ ] ¿Se manejan los errores correctamente?
- [ ] ¿Hay validación de datos de entrada?
- [ ] ¿El código es seguro?

#### Author Checklist
- [ ] Tests pasan localmente
- [ ] Linting pasa sin errores
- [ ] Documentación actualizada
- [ ] Variables de entorno documentadas
- [ ] Migraciones incluidas (si aplica)
- [ ] Breaking changes documentados

## 🧪 Testing

### Testing Strategy

#### Pirámide de Testing
```
        /\
       /  \
      / E2E \     ← 10% (Cypress)
     /______\
    /        \
   / Integration \  ← 20% (API tests)
  /______________\
 /                \
/   Unit Tests     \  ← 70% (Jest)
\__________________/
```

### Backend Testing

#### Unit Tests
```javascript
// users.service.test.js
const { UserService } = require('../src/services');

describe('UserService', () => {
  describe('createUser', () => {
    it('should create user with valid data', async () => {
      const userData = {
        nombre: 'Juan',
        email: 'juan@ejemplo.com',
        password: 'password123'
      };
      
      const user = await UserService.create(userData);
      
      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
      expect(user.password).not.toBe(userData.password); // Should be hashed
    });
    
    it('should throw error with invalid email', async () => {
      const userData = {
        nombre: 'Juan',
        email: 'invalid-email',
        password: 'password123'
      };
      
      await expect(UserService.create(userData)).rejects.toThrow('Email inválido');
    });
  });
});
```

#### Integration Tests
```javascript
// auth.integration.test.js
const request = require('supertest');
const app = require('../src/app');

describe('Auth Integration', () => {
  it('should login with valid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@cafeteria.com',
        password: 'admin123'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });
});
```

### Frontend Testing

#### Component Tests
```javascript
// UserProfile.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import UserProfile from './UserProfile';

const renderWithProvider = (component) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('UserProfile', () => {
  it('should render user information', () => {
    const user = {
      nombre: 'Juan',
      email: 'juan@ejemplo.com'
    };
    
    renderWithProvider(<UserProfile user={user} />);
    
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('juan@ejemplo.com')).toBeInTheDocument();
  });
  
  it('should update profile on form submit', async () => {
    const mockUpdateProfile = jest.fn();
    
    renderWithProvider(
      <UserProfile user={user} onUpdateProfile={mockUpdateProfile} />
    );
    
    fireEvent.change(screen.getByLabelText('Nombre'), {
      target: { value: 'Juan Carlos' }
    });
    
    fireEvent.click(screen.getByText('Guardar'));
    
    expect(mockUpdateProfile).toHaveBeenCalledWith({
      ...user,
      nombre: 'Juan Carlos'
    });
  });
});
```

#### E2E Tests (Cypress)
```javascript
// cypress/integration/auth.spec.js
describe('Authentication Flow', () => {
  it('should login successfully', () => {
    cy.visit('/login');
    
    cy.get('[data-testid=email-input]').type('admin@cafeteria.com');
    cy.get('[data-testid=password-input]').type('admin123');
    cy.get('[data-testid=login-button]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=user-menu]').should('contain', 'Admin');
  });
});
```

### Test Data Management

#### Factories
```javascript
// factories/user.factory.js
const { faker } = require('@faker-js/faker');

const createUser = (overrides = {}) => ({
  nombre: faker.person.firstName(),
  apellido: faker.person.lastName(),
  email: faker.internet.email(),
  password: 'password123',
  rol: 'cliente',
  ...overrides
});

module.exports = { createUser };
```

## 🗄️ Base de Datos

### Migrations Guidelines

#### Naming Convention
```bash
# Formato: YYYYMMDDHHMMSS_description.sql
20241215120000_create_users_table.sql
20241215120100_add_email_index_to_users.sql
20241215120200_alter_products_add_category.sql
```

#### Migration Template
```sql
-- Migration: 20241215120000_create_users_table.sql
-- Description: Create users table with basic fields

-- UP
CREATE TABLE usuarios (
    usuario_id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INTEGER REFERENCES roles(rol_id),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);

-- DOWN (para rollback)
DROP TABLE IF EXISTS usuarios;
```

### Database Best Practices

#### Naming Conventions
```sql
-- Tablas: plural, snake_case
usuarios, productos, carritos_items

-- Campos: snake_case
usuario_id, fecha_creacion, password_hash

-- Indexes: idx_table_field
idx_usuarios_email, idx_productos_categoria_id

-- Foreign Keys: fk_table_referenced_table
fk_productos_categorias, fk_pedidos_usuarios
```

#### Performance Guidelines
```sql
-- ✅ Uso correcto de índices
CREATE INDEX idx_productos_categoria_activo ON productos(categoria_id, activo);

-- ✅ Consultas optimizadas
SELECT p.nombre, c.nombre as categoria 
FROM productos p 
INNER JOIN categorias c ON p.categoria_id = c.categoria_id 
WHERE p.activo = true;

-- ❌ Evitar SELECT *
SELECT * FROM productos; 

-- ✅ Específico
SELECT nombre, precio, descripcion FROM productos WHERE activo = true;
```

## 🔌 API Guidelines

### RESTful API Design

#### Naming Conventions
```bash
# Recursos: plural, kebab-case
GET    /api/usuarios              # Lista usuarios
POST   /api/usuarios              # Crear usuario
GET    /api/usuarios/{id}         # Obtener usuario
PUT    /api/usuarios/{id}         # Actualizar usuario
DELETE /api/usuarios/{id}         # Eliminar usuario

# Sub-recursos
GET    /api/usuarios/{id}/pedidos # Pedidos del usuario
POST   /api/productos/{id}/resenas # Crear reseña de producto
```

#### Response Format
```javascript
// ✅ Success Response
{
  "success": true,
  "data": {
    "usuario": {
      "id": 1,
      "nombre": "Juan",
      "email": "juan@ejemplo.com"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "version": "1.0.0"
  }
}

// ✅ Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Datos de entrada inválidos",
    "details": [
      {
        "field": "email",
        "message": "Email es requerido"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456"
  }
}
```

#### HTTP Status Codes
```javascript
// Success
200 - OK (GET, PUT successful)
201 - Created (POST successful)
204 - No Content (DELETE successful)

// Client Errors
400 - Bad Request (validation errors)
401 - Unauthorized (authentication required)
403 - Forbidden (insufficient permissions)
404 - Not Found (resource doesn't exist)
409 - Conflict (duplicate resource)
422 - Unprocessable Entity (semantic errors)

// Server Errors
500 - Internal Server Error
502 - Bad Gateway
503 - Service Unavailable
```

### Input Validation

#### Joi Schemas
```javascript
// schemas/user.schema.js
const Joi = require('joi');

const createUserSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  apellido: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
  telefono: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
});

module.exports = { createUserSchema };
```

#### Validation Middleware
```javascript
// middlewares/validation.middleware.js
const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Datos de entrada inválidos',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        }
      });
    }
    
    next();
  };
};
```

## 🎨 Frontend Guidelines

### Component Structure

#### Component Template
```javascript
// components/UserCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import './UserCard.css';

/**
 * UserCard component displays user information in a card format
 * @param {Object} props - Component props
 * @param {Object} props.user - User object
 * @param {Function} props.onEdit - Edit callback
 * @param {Function} props.onDelete - Delete callback
 */
const UserCard = ({ user, onEdit, onDelete, className = '' }) => {
  const { isLoading } = useSelector(state => state.users);
  const dispatch = useDispatch();

  const handleEdit = () => {
    onEdit?.(user.id);
  };

  const handleDelete = () => {
    if (window.confirm('¿Estás seguro de eliminar este usuario?')) {
      onDelete?.(user.id);
    }
  };

  if (isLoading) {
    return <div className="user-card-skeleton" />;
  }

  return (
    <div className={`user-card ${className}`} data-testid="user-card">
      <div className="user-card__header">
        <img 
          src={user.avatar || '/default-avatar.png'} 
          alt={`Avatar de ${user.nombre}`}
          className="user-card__avatar"
        />
        <div className="user-card__info">
          <h3 className="user-card__name">
            {user.nombre} {user.apellido}
          </h3>
          <p className="user-card__email">{user.email}</p>
        </div>
      </div>
      
      <div className="user-card__actions">
        <button 
          onClick={handleEdit}
          className="btn btn--secondary"
          data-testid="edit-button"
        >
          Editar
        </button>
        <button 
          onClick={handleDelete}
          className="btn btn--danger"
          data-testid="delete-button"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired,
    apellido: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    avatar: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  className: PropTypes.string
};

export default UserCard;
```

### Custom Hooks

#### API Hook Template
```javascript
// hooks/useUsers.js
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser, updateUser, deleteUser } from '../store/slices/usersSlice';

export const useUsers = () => {
  const dispatch = useDispatch();
  const { users, isLoading, error } = useSelector(state => state.users);
  
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    active: true
  });

  useEffect(() => {
    dispatch(fetchUsers(filters));
  }, [dispatch, filters]);

  const handleCreateUser = async (userData) => {
    try {
      await dispatch(createUser(userData)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleUpdateUser = async (id, userData) => {
    try {
      await dispatch(updateUser({ id, data: userData })).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const handleDeleteUser = async (id) => {
    try {
      await dispatch(deleteUser(id)).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  return {
    users,
    isLoading,
    error,
    filters,
    setFilters,
    createUser: handleCreateUser,
    updateUser: handleUpdateUser,
    deleteUser: handleDeleteUser
  };
};
```

### State Management

#### Redux Slice Template
```javascript
// store/slices/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { usersApi } from '../../services/usersApi';

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (filters, { rejectWithValue }) => {
    try {
      const response = await usersApi.getUsers(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al cargar usuarios');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await usersApi.createUser(userData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al crear usuario');
    }
  }
);

// Slice
const usersSlice = createSlice({
  name: 'users',
  initialState: {
    users: [],
    currentUser: null,
    isLoading: false,
    error: null,
    filters: {}
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentUser: (state, action) => {
      state.currentUser = action.payload;
    },
    updateUserLocally: (state, action) => {
      const { id, updates } = action.payload;
      const userIndex = state.users.findIndex(user => user.id === id);
      if (userIndex !== -1) {
        state.users[userIndex] = { ...state.users[userIndex], ...updates };
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.users = action.payload.users;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create user
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload.user);
      });
  }
});

export const { clearError, setCurrentUser, updateUserLocally } = usersSlice.actions;
export default usersSlice.reducer;
```

## ⚡ Performance

### Frontend Optimization

#### Code Splitting
```javascript
// App.jsx - Lazy loading
import { lazy, Suspense } from 'react';

const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));

function App() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <Routes>
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
      </Routes>
    </Suspense>
  );
}
```

#### Memoization
```javascript
// Memoizar componentes pesados
const ExpensiveComponent = React.memo(({ data, onUpdate }) => {
  const processedData = useMemo(() => {
    return data.map(item => complexCalculation(item));
  }, [data]);
  
  const handleUpdate = useCallback((id, newData) => {
    onUpdate(id, newData);
  }, [onUpdate]);
  
  return (
    <div>
      {processedData.map(item => (
        <Item key={item.id} data={item} onUpdate={handleUpdate} />
      ))}
    </div>
  );
});
```

### Backend Optimization

#### Database Queries
```javascript
// ✅ Optimizado - Solo campos necesarios
const getUsers = async (filters) => {
  return await User.findAll({
    attributes: ['id', 'nombre', 'email', 'activo'],
    where: filters,
    include: [{
      model: Role,
      attributes: ['nombre']
    }],
    limit: 20,
    offset: filters.page * 20
  });
};

// ❌ No optimizado
const getUsers = async () => {
  return await User.findAll({
    include: [{ all: true }]
  });
};
```

#### Caching Strategy
```javascript
// services/cache.service.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

class CacheService {
  static async get(key) {
    try {
      const cached = await redis.get(key);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  static async set(key, data, ttl = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(data));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }
  
  static async del(pattern) {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }
}

// Uso en controladores
const getProducts = async (req, res) => {
  const cacheKey = `products:${JSON.stringify(req.query)}`;
  
  // Intentar obtener del cache
  let products = await CacheService.get(cacheKey);
  
  if (!products) {
    // Si no está en cache, obtener de BD
    products = await ProductService.getProducts(req.query);
    
    // Guardar en cache por 1 hora
    await CacheService.set(cacheKey, products, 3600);
  }
  
  res.json({ success: true, data: products });
};
```

## 🔒 Seguridad

### Input Validation & Sanitization

```javascript
// utils/sanitize.js
const DOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

const window = new JSDOM('').window;
const purify = DOMPurify(window);

const sanitizeInput = (input) => {
  if (typeof input === 'string') {
    return purify.sanitize(input.trim());
  }
  return input;
};

const sanitizeObject = (obj) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = sanitizeInput(value);
    }
  }
  return sanitized;
};
```

### Authentication & Authorization

```javascript
// middlewares/auth.middleware.js
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      error: { message: 'Token de acceso requerido' }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password_hash'] }
    });
    
    if (!user || !user.activo) {
      return res.status(401).json({
        success: false,
        error: { message: 'Usuario no encontrado o inactivo' }
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: { message: 'Token inválido' }
    });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { message: 'Usuario no autenticado' }
      });
    }
    
    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: { message: 'Permisos insuficientes' }
      });
    }
    
    next();
  };
};
```

### Environment Variables Security

```javascript
// config/env.validation.js
const Joi = require('joi');

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').required(),
  PORT: Joi.number().default(3000),
  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  CORS_ORIGIN: Joi.string().uri().required()
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = envVars;
```

## 🚀 Deployment

### CI/CD Pipeline

#### GitHub Actions Workflow
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install Backend Dependencies
      run: |
        cd backend
        npm ci
    
    - name: Install Frontend Dependencies
      run: |
        cd frontend
        npm ci
    
    - name: Run Backend Tests
      run: |
        cd backend
        npm run test:coverage
      env:
        DB_HOST: localhost
        DB_PORT: 5432
        DB_NAME: test_db
        DB_USER: postgres
        DB_PASS: postgres
        JWT_SECRET: test_secret_key_for_testing_purposes_only
    
    - name: Run Frontend Tests
      run: |
        cd frontend
        npm run test:coverage
    
    - name: Lint Backend
      run: |
        cd backend
        npm run lint
    
    - name: Lint Frontend
      run: |
        cd frontend
        npm run lint
    
    - name: Build Frontend
      run: |
        cd frontend
        npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Production
      run: |
        echo "Deploy to production"
        # Add deployment commands here
```

### Docker Production Setup

#### Multi-stage Dockerfile (Backend)
```dockerfile
# Backend Production Dockerfile
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
RUN addgroup -g 1001 -S nodejs && adduser -S backend -u 1001
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY --from=build --chown=backend:nodejs /app/dist ./dist
COPY --from=build --chown=backend:nodejs /app/package*.json ./

USER backend
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment-specific Configurations

#### Production Environment Variables
```bash
# .env.production
NODE_ENV=production
PORT=3000

# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=cafeteria_production
DB_USER=your-db-user
DB_PASS=your-secure-db-password

# Security
JWT_SECRET=your-super-secure-jwt-secret-minimum-64-characters
CORS_ORIGIN=https://your-domain.com

# Redis
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Monitoring
SENTRY_DSN=your-sentry-dsn
LOG_LEVEL=warn
```

### Health Checks

```javascript
// routes/health.routes.js
const express = require('express');
const { pool } = require('../config/database');
const redis = require('../config/redis');
const router = express.Router();

router.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {}
  };
  
  try {
    // Check database
    await pool.query('SELECT 1');
    health.services.database = 'OK';
  } catch (error) {
    health.services.database = 'ERROR';
    health.status = 'ERROR';
  }
  
  try {
    // Check Redis
    await redis.ping();
    health.services.redis = 'OK';
  } catch (error) {
    health.services.redis = 'ERROR';
  }
  
  const statusCode = health.status === 'OK' ? 200 : 503;
  res.status(statusCode).json(health);
});
```

---

## 📚 Recursos Adicionales

### Documentación Oficial
- [Node.js](https://nodejs.org/docs/)
- [React](https://react.dev/)
- [PostgreSQL](https://www.postgresql.org/docs/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tools & Libraries
- [ESLint](https://eslint.org/) - Linting
- [Prettier](https://prettier.io/) - Code formatting
- [Jest](https://jestjs.io/) - Testing framework
- [Cypress](https://www.cypress.io/) - E2E testing
- [Joi](https://joi.dev/) - Data validation

### Best Practices
- [Clean Code](https://github.com/ryanmcdermott/clean-code-javascript)
- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**¡Happy Coding!** 🚀

Si tienes dudas sobre algún aspecto del desarrollo, consulta esta guía o contacta al equipo. 