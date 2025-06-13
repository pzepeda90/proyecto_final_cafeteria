# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Gestión de Cafetería L'Bandito! Esta guía te ayudará a empezar a contribuir de manera efectiva.

## 📋 Tabla de Contenidos

- [Código de Conducta](#-código-de-conducta)
- [Cómo Contribuir](#-cómo-contribuir)
- [Tipos de Contribuciones](#-tipos-de-contribuciones)
- [Configuración del Entorno](#-configuración-del-entorno)
- [Flujo de Desarrollo](#-flujo-de-desarrollo)
- [Estándares de Código](#-estándares-de-código)
- [Guías Específicas](#-guías-específicas)
- [Proceso de Review](#-proceso-de-review)
- [Recursos Adicionales](#-recursos-adicionales)

## 📜 Código de Conducta

Este proyecto se adhiere al código de conducta de la comunidad. Al participar, se espera que mantengas este código:

### Nuestro Compromiso
Nosotros, como miembros, contribuyentes y administradores, nos comprometemos a hacer de la participación en nuestra comunidad una experiencia libre de acoso para todos.

### Estándares
Ejemplos de comportamiento que contribuye a crear un ambiente positivo:
- ✅ Usar un lenguaje acogedor e inclusivo
- ✅ Respetar los diferentes puntos de vista y experiencias
- ✅ Aceptar las críticas constructivas con gracia
- ✅ Enfocarse en lo que es mejor para la comunidad
- ✅ Mostrar empatía hacia otros miembros de la comunidad

Ejemplos de comportamiento inaceptable:
- ❌ Uso de lenguaje o imágenes sexualizadas
- ❌ Ataques personales o políticos
- ❌ Acoso público o privado
- ❌ Publicar información privada de otros sin su consentimiento
- ❌ Otras conductas que razonablemente se considerarían inapropiadas

### Aplicación
Los casos de comportamiento abusivo pueden ser reportados contactando al equipo del proyecto en [conducta@cafeteria-lbandito.com]. Todas las quejas serán revisadas e investigadas.

## 🚀 Cómo Contribuir

### Antes de Contribuir

1. **Busca issues existentes** antes de crear uno nuevo
2. **Lee la documentación** para entender la arquitectura
3. **Configura tu entorno** siguiendo la [guía de instalación](INSTALLATION.md)
4. **Únete a nuestra comunidad** en [Discord](link-discord)

### Primeros Pasos

1. **Fork** el repositorio
2. **Clona** tu fork localmente
3. **Configura** el repositorio upstream
4. **Crea** una rama para tu contribución
5. **Haz** tus cambios
6. **Testea** tus cambios
7. **Envía** un Pull Request

```bash
# Fork en GitHub, luego:
git clone https://github.com/TU_USUARIO/cafeteria-l-bandito.git
cd cafeteria-l-bandito

# Configurar upstream
git remote add upstream https://github.com/ORIGINAL_USUARIO/cafeteria-l-bandito.git

# Crear rama para tu feature
git checkout -b feature/mi-nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push y crear PR
git push origin feature/mi-nueva-funcionalidad
```

## 🎯 Tipos de Contribuciones

Valoramos todos los tipos de contribuciones:

### 🐛 Reportar Bugs
Utiliza la plantilla de bug report e incluye:
- Descripción clara del problema
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots si es relevante
- Información del entorno (OS, Node version, etc.)

### ✨ Sugerir Features
Para nuevas funcionalidades:
- Usa la plantilla de feature request
- Explica el problema que resuelve
- Describe la solución propuesta
- Considera alternativas

### 📝 Documentación
- Corregir errores tipográficos
- Mejorar explicaciones
- Agregar ejemplos
- Traducir documentación

### 🧪 Testing
- Agregar tests unitarios
- Mejorar coverage
- Tests de integración
- Tests end-to-end

### 🎨 UI/UX
- Mejoras de diseño
- Optimizaciones de UX
- Accesibilidad
- Responsive design

### ⚡ Performance
- Optimizaciones de rendimiento
- Reducción de bundle size
- Mejoras de queries
- Optimización de imágenes

### 🔒 Seguridad
- Reportar vulnerabilidades
- Mejoras de seguridad
- Actualizaciones de dependencias

## 🛠️ Configuración del Entorno

### Prerrequisitos
```bash
Node.js >= 18.0.0
PostgreSQL >= 14.0
Git >= 2.30.0
Docker (opcional)
```

### Instalación Completa
```bash
# 1. Clonar y configurar
git clone https://github.com/TU_USUARIO/cafeteria-l-bandito.git
cd cafeteria-l-bandito

# 2. Instalar dependencias
npm run install:all

# 3. Configurar base de datos
createdb cafeteria_dev
cp backend/env.example backend/.env
# Editar .env con tus configuraciones

# 4. Ejecutar migraciones
cd backend && npm run migrate && npm run seed

# 5. Iniciar servidores
npm run dev:all
```

### Herramientas Recomendadas
```json
// .vscode/extensions.json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 🔄 Flujo de Desarrollo

### Branching Strategy

```
main                    # Rama principal (producción)
├── develop            # Rama de desarrollo
├── feature/auth       # Nueva funcionalidad
├── bugfix/login-fix   # Corrección de bugs
├── hotfix/security    # Hotfixes críticos
└── docs/api-update    # Mejoras de documentación
```

### Naming Conventions

#### Branches
```bash
feature/nombre-de-feature    # Nuevas funcionalidades
bugfix/descripcion-bug       # Corrección de bugs
hotfix/descripcion-urgente   # Fixes críticos
docs/descripcion-doc         # Documentación
refactor/descripcion-refact  # Refactoring
test/descripcion-test        # Testing
```

#### Commits
Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```bash
feat: agregar sistema de notificaciones
fix: corregir validación de email en registro
docs: actualizar documentación de API
style: corregir formateo en UserCard component
refactor: optimizar queries de productos
test: agregar tests para auth service
chore: actualizar dependencias
```

### Workflow Detallado

#### 1. Preparación
```bash
# Asegurar que main está actualizado
git checkout main
git pull upstream main

# Crear nueva rama
git checkout -b feature/mi-nueva-funcionalidad
```

#### 2. Desarrollo
```bash
# Desarrollar en pequeños commits
git add .
git commit -m "feat: agregar validación de formulario"

# Continuar desarrollo...
git commit -m "test: agregar tests para validación"
git commit -m "docs: documentar nueva validación"
```

#### 3. Testing
```bash
# Ejecutar todos los tests
npm run test:all

# Linting
npm run lint:fix

# Build para verificar
npm run build:all
```

#### 4. Actualizar con main
```bash
# Antes de enviar PR, actualizar con main
git fetch upstream
git rebase upstream/main

# Resolver conflictos si existen
git add .
git rebase --continue
```

#### 5. Push y PR
```bash
# Push de la rama
git push origin feature/mi-nueva-funcionalidad

# Crear PR en GitHub
```

## 📏 Estándares de Código

### JavaScript/React

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
    "prefer-const": "error"
  }
}
```

#### Naming Conventions
```javascript
// ✅ Variables y funciones - camelCase
const userName = 'patricio';
const calculateTotal = () => {};

// ✅ Componentes - PascalCase
const UserProfile = () => {};
const ProductCard = () => {};

// ✅ Constantes - SCREAMING_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000';
const USER_ROLES = {
  ADMIN: 'admin',
  VENDEDOR: 'vendedor'
};

// ✅ Archivos - kebab-case o PascalCase
user-profile.js
UserProfile.jsx
auth.service.js
```

#### Code Style
```javascript
// ✅ Destructuring
const { name, email } = user;

// ✅ Arrow functions para funciones simples
const getFullName = (user) => `${user.nombre} ${user.apellido}`;

// ✅ Template literals
const message = `Hola ${user.nombre}, tienes ${orders.length} pedidos`;

// ✅ Async/await en lugar de .then()
const fetchUsers = async () => {
  try {
    const response = await api.get('/usuarios');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
```

### React Specific

#### Component Structure
```javascript
// UserCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './UserCard.css';

/**
 * UserCard component displays user information
 * @param {Object} props - Component props
 * @param {Object} props.user - User object
 * @param {Function} props.onEdit - Edit callback
 */
const UserCard = ({ user, onEdit, className = '' }) => {
  // Hooks primero
  const [isLoading, setIsLoading] = useState(false);
  
  // Event handlers
  const handleEdit = () => {
    onEdit?.(user.id);
  };
  
  // Early returns
  if (!user) return null;
  
  // Render
  return (
    <div className={`user-card ${className}`}>
      <h3>{user.nombre}</h3>
      <button onClick={handleEdit}>Editar</button>
    </div>
  );
};

// PropTypes
UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.number.isRequired,
    nombre: PropTypes.string.isRequired
  }).isRequired,
  onEdit: PropTypes.func,
  className: PropTypes.string
};

export default UserCard;
```

#### Hooks Guidelines
```javascript
// ✅ Custom hooks para lógica reutilizable
const useProducts = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/productos');
      setProducts(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);
  
  return { products, isLoading, refetch: fetchProducts };
};
```

### CSS/Styling

#### Tailwind CSS Guidelines
```javascript
// ✅ Orden de clases: layout → box model → typography → visual → misc
<div className="flex items-center justify-between p-4 mb-4 text-lg font-semibold bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">

// ✅ Usar @apply para componentes complejos
// styles/components.css
.btn-primary {
  @apply px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors;
}
```

### Backend (Node.js)

#### API Structure
```javascript
// controllers/users.controller.js
const UserService = require('../services/user.service');
const { validateUserData } = require('../utils/validation');

/**
 * Get all users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    
    const filters = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Max 100
      search: search.trim()
    };
    
    const result = await UserService.getUsers(filters);
    
    res.json({
      success: true,
      data: result,
      meta: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  } catch (error) {
    console.error('Error in getUsers:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Error interno del servidor'
      }
    });
  }
};
```

#### Database Queries
```javascript
// services/user.service.js
const { User, Role } = require('../models');

class UserService {
  static async getUsers(filters) {
    const { page, limit, search } = filters;
    const offset = (page - 1) * limit;
    
    const whereClause = {};
    if (search) {
      whereClause[Op.or] = [
        { nombre: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const { rows: users, count: total } = await User.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Role,
          attributes: ['nombre']
        }
      ],
      attributes: { exclude: ['password_hash'] },
      offset,
      limit,
      order: [['fechaCreacion', 'DESC']]
    });
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
}
```

## 📋 Guías Específicas

### Testing Guidelines

#### Unit Tests
```javascript
// tests/services/user.service.test.js
const { UserService } = require('../../src/services');
const { User } = require('../../src/models');

// Mock models
jest.mock('../../src/models');

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getUsers', () => {
    it('should return paginated users', async () => {
      // Arrange
      const mockUsers = [
        { id: 1, nombre: 'Juan', email: 'juan@test.com' }
      ];
      User.findAndCountAll.mockResolvedValue({
        rows: mockUsers,
        count: 1
      });
      
      // Act
      const result = await UserService.getUsers({ page: 1, limit: 10 });
      
      // Assert
      expect(result.users).toEqual(mockUsers);
      expect(result.pagination.total).toBe(1);
      expect(User.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          offset: 0,
          limit: 10
        })
      );
    });
  });
});
```

#### Component Tests
```javascript
// tests/components/UserCard.test.jsx
import { render, screen, fireEvent } from '@testing-library/react';
import UserCard from '../UserCard';

describe('UserCard', () => {
  const mockUser = {
    id: 1,
    nombre: 'Juan',
    email: 'juan@test.com'
  };
  
  it('should render user information', () => {
    render(<UserCard user={mockUser} />);
    
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('juan@test.com')).toBeInTheDocument();
  });
  
  it('should call onEdit when edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    
    render(<UserCard user={mockUser} onEdit={mockOnEdit} />);
    
    fireEvent.click(screen.getByText('Editar'));
    
    expect(mockOnEdit).toHaveBeenCalledWith(1);
  });
});
```

### Documentation Guidelines

#### JSDoc Comments
```javascript
/**
 * Calculate the total price including taxes
 * @param {number} subtotal - The subtotal amount
 * @param {number} taxRate - The tax rate (0.19 for 19%)
 * @returns {number} The total amount with taxes
 * @example
 * const total = calculateTotal(1000, 0.19); // 1190
 */
const calculateTotal = (subtotal, taxRate) => {
  return subtotal * (1 + taxRate);
};
```

#### API Documentation
```javascript
/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
```

### Accessibility Guidelines

```javascript
// ✅ Semantic HTML
<button type="button" onClick={handleClick}>
  Editar Usuario
</button>

// ✅ ARIA labels
<input
  type="search"
  placeholder="Buscar usuarios..."
  aria-label="Buscar usuarios"
  aria-describedby="search-help"
/>
<div id="search-help">Ingresa el nombre o email del usuario</div>

// ✅ Focus management
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef();
  
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);
  
  return isOpen ? (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      {children}
    </div>
  ) : null;
};
```

## 🔍 Proceso de Review

### Checklist del Autor

Antes de enviar tu PR, verifica:

#### General
- [ ] El código sigue los estándares del proyecto
- [ ] Todos los tests pasan localmente
- [ ] No hay console.log en código de producción
- [ ] Las variables de entorno están documentadas
- [ ] El código está libre de errores de linting

#### Backend
- [ ] Los endpoints tienen validación de entrada
- [ ] Los errores se manejan apropiadamente
- [ ] Las consultas DB están optimizadas
- [ ] Hay tests unitarios para la nueva funcionalidad
- [ ] La documentación de API está actualizada

#### Frontend
- [ ] Componentes tienen PropTypes/TypeScript
- [ ] Hay tests para componentes nuevos/modificados
- [ ] La UI es responsive
- [ ] Se consideró la accesibilidad
- [ ] Los estados de loading/error están manejados

#### Database
- [ ] Las migraciones son reversibles
- [ ] Los índices necesarios están creados
- [ ] Los datos sensibles no están en commits

### Checklist del Reviewer

#### Funcionalidad
- [ ] El código hace lo que dice que hace
- [ ] La funcionalidad es útil y necesaria
- [ ] No introduce regresiones
- [ ] Los edge cases están considerados

#### Código
- [ ] El código es legible y mantenible
- [ ] No hay duplicación innecesaria
- [ ] Los nombres son descriptivos
- [ ] La arquitectura es consistente

#### Testing
- [ ] Los tests cubren los casos importantes
- [ ] Los tests son comprensibles
- [ ] Los mocks son apropiados
- [ ] No hay tests flaky

#### Seguridad
- [ ] No hay vulnerabilidades obvias
- [ ] Los datos se validan correctamente
- [ ] Los permisos se verifican
- [ ] No hay información sensible expuesta

### Proceso de Review

1. **Auto-review**: El autor revisa su propio código
2. **Automated checks**: CI/CD ejecuta tests y linting
3. **Peer review**: Otro desarrollador revisa el código
4. **Address feedback**: El autor corrige comentarios
5. **Final approval**: Mantainer aprueba el PR
6. **Merge**: Se integra a la rama principal

### Tipos de Comentarios

#### Comentarios Constructivos
```
// ✅ Bueno
"Considera usar useMemo aquí para optimizar re-renders"
"¿Podrías agregar un test para el caso de error?"
"Este nombre de variable podría ser más descriptivo"

// ❌ No constructivo
"Esto está mal"
"No me gusta este approach"
"Cambia esto"
```

## 📚 Recursos Adicionales

### Documentación del Proyecto
- [Guía de Instalación](INSTALLATION.md)
- [Guía de Desarrollo](DEVELOPMENT.md)
- [Documentación de API](API.md)
- [README Principal](../README.md)

### Herramientas y Links Útiles
- [React DevTools](https://react.dev/learn/react-developer-tools)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)

### Comunidad
- 💬 **Discord**: [Servidor de la comunidad](link-discord)
- 📧 **Email**: contribuciones@cafeteria-lbandito.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/usuario/proyecto/issues)
- 💡 **Discussions**: [GitHub Discussions](https://github.com/usuario/proyecto/discussions)

### Templates

#### Bug Report Template
```markdown
**Descripción del Bug**
Descripción clara del problema.

**Para Reproducir**
Pasos para reproducir:
1. Ir a '...'
2. Hacer click en '....'
3. Scrollear hasta '....'
4. Ver el error

**Comportamiento Esperado**
Descripción clara de lo que esperabas que pasara.

**Screenshots**
Si aplica, agrega screenshots.

**Información del Entorno:**
 - OS: [e.g. macOS, Ubuntu]
 - Navegador [e.g. chrome, safari]
 - Versión [e.g. 22]
 - Node.js version [e.g. 18.19.0]

**Contexto Adicional**
Cualquier otra información relevante.
```

#### Feature Request Template
```markdown
**¿Tu feature request está relacionada con un problema?**
Descripción clara del problema. Ej. "Me frustra cuando [...]"

**Describe la solución que te gustaría**
Descripción clara de lo que quieres que pase.

**Describe alternativas que hayas considerado**
Descripción de cualquier solución alternativa.

**Contexto adicional**
Cualquier otra información, mockups, etc.
```

## 🎉 Reconocimientos

### Contributors Hall of Fame
Agradecemos a todos los que han contribuido:

- [@patricio-zepeda](https://github.com/patricio-zepeda) - Project Creator & Maintainer

### Cómo ser Reconocido
- Contribuciones de código
- Reportar bugs importantes
- Mejorar documentación
- Ayudar en la comunidad
- Mentoría a nuevos contribuidores

---

## 🙏 Agradecimientos

Gracias por considerar contribuir a nuestro proyecto. Cada contribución, sin importar el tamaño, hace que el proyecto sea mejor para todos.

**¡Esperamos ver tus contribuciones pronto!** 🚀

---

Si tienes preguntas sobre cómo contribuir, no dudes en:
- Abrir un [issue](https://github.com/usuario/proyecto/issues)
- Preguntar en [Discord](link-discord)
- Enviar un email a contribuciones@cafeteria-lbandito.com 