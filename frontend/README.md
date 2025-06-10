# L'BANDITO - Sistema de Gestión de Cafetería

Frontend del sistema de gestión para la cafetería L'BANDITO, desarrollado con React y Vite.

## Tecnologías Principales

- React 18
- Vite 5
- Redux Toolkit
- React Router DOM 6
- Tailwind CSS 3
- Axios
- Jest + React Testing Library

## Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/          # Componentes atómicos reutilizables
│   │   ├── layout/      # Componentes de layout (Navbar, Footer, etc.)
│   │   └── features/    # Componentes específicos por funcionalidad
│   ├── pages/           # Páginas/Rutas de la aplicación
│   ├── store/           # Configuración de Redux y slices
│   ├── services/        # Servicios (API, autenticación, etc.)
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utilidades y helpers
│   ├── constants/       # Constantes y configuraciones
│   └── styles/          # Estilos globales
├── public/              # Archivos estáticos
└── tests/               # Tests unitarios y de integración
```

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Vista previa de la build de producción
- `npm run lint`: Ejecuta ESLint
- `npm run format`: Formatea el código con Prettier
- `npm test`: Ejecuta los tests
- `npm run test:watch`: Ejecuta los tests en modo watch

## Configuración del Entorno

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Crear archivo `.env` basado en `.env.example`
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## Convenciones de Código

- ESLint con configuración de Airbnb
- Prettier para formateo de código
- Husky para pre-commit hooks
- Commitizen para commits convencionales

## Testing

- Jest como test runner
- React Testing Library para tests de componentes
- Tests unitarios para utilidades y hooks
- Tests de integración para flujos completos

## Características Principales

- Autenticación y autorización basada en roles
- Gestión de productos y categorías
- Sistema de carritos de compra
- Gestión de pedidos
- Panel de administración
- Interfaz de punto de venta
- Perfiles de usuario
- Sistema de notificaciones

## Contribución

1. Crear una nueva rama para cada feature
2. Seguir las convenciones de commits
3. Asegurar que los tests pasen
4. Crear un Pull Request

## Licencia

Este proyecto es privado y confidencial.
