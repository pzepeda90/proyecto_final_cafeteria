# 🔄 Pull Request

## 📋 Descripción

Describe brevemente los cambios realizados en este PR.

Fixes #(issue number) <!-- Si aplica, reemplaza con el número del issue -->

## 🎯 Tipo de Cambio

Marca el tipo de cambio que aplica:

- [ ] 🐛 Bug fix (cambio que corrige un issue)
- [ ] ✨ Nueva funcionalidad (cambio que agrega funcionalidad)
- [ ] 💥 Breaking change (fix o feature que cambiaría funcionalidad existente)
- [ ] 📝 Documentación (cambios solo en documentación)
- [ ] 🎨 Estilo (formateo, espacios, etc; sin cambios de código)
- [ ] ♻️ Refactor (cambio de código que no corrige bugs ni agrega features)
- [ ] ⚡ Performance (cambio que mejora el rendimiento)
- [ ] 🧪 Tests (agregar tests faltantes o corregir tests existentes)
- [ ] 🔧 Chore (cambios en build process, herramientas auxiliares, etc)

## 🧪 Testing

Describe las pruebas que realizaste para verificar tus cambios:

- [ ] Tests unitarios pasan
- [ ] Tests de integración pasan
- [ ] Tests manuales realizados
- [ ] No se requieren tests

**Configuración de test:**
- Node.js version:
- npm version:

## 📸 Screenshots

Si aplica, agrega screenshots para mostrar los cambios visuales.

| Antes | Después |
|-------|---------|
| ![Antes](url) | ![Después](url) |

## 📝 Checklist

### General
- [ ] Mi código sigue los estándares de estilo del proyecto
- [ ] He realizado una auto-revisión de mi código
- [ ] He comentado mi código, particularmente en áreas difíciles de entender
- [ ] He realizado los cambios correspondientes en la documentación
- [ ] Mis cambios no generan nuevas advertencias
- [ ] He agregado tests que prueban que mi fix es efectivo o que mi feature funciona
- [ ] Los tests unitarios nuevos y existentes pasan localmente con mis cambios

### Frontend (si aplica)
- [ ] Los componentes tienen PropTypes definidos
- [ ] Los componentes son responsive
- [ ] Se consideró la accesibilidad (ARIA labels, keyboard navigation)
- [ ] Los estados de loading/error están manejados
- [ ] No hay console.log en código de producción

### Backend (si aplica)
- [ ] Los endpoints tienen validación de entrada
- [ ] Los errores se manejan apropiadamente
- [ ] Las consultas DB están optimizadas
- [ ] Se agregaron/actualizaron tests para nuevos endpoints
- [ ] La documentación de API está actualizada

### Database (si aplica)
- [ ] Las migraciones son reversibles
- [ ] Se agregaron índices necesarios
- [ ] No hay datos sensibles en el código

## 🔗 Issues Relacionados

Lista cualquier issue relacionado:
- Closes #123
- Related to #456

## 📚 Documentación

- [ ] README actualizado
- [ ] Documentación de API actualizada
- [ ] CHANGELOG actualizado
- [ ] Variables de entorno documentadas

## 🚀 Deployment

- [ ] Los cambios han sido probados en entorno de desarrollo
- [ ] No se requieren cambios en variables de entorno
- [ ] No se requieren migraciones de base de datos
- [ ] Compatible con versión actual de producción

## 📎 Información Adicional

Agrega cualquier información adicional que consideres relevante para el review.

---

## Para los Reviewers

### Áreas de Enfoque

Por favor, presta especial atención a:

- [ ] Lógica de negocio
- [ ] Seguridad
- [ ] Performance
- [ ] Testing
- [ ] Documentación

### Preguntas Específicas

¿Hay algo específico sobre lo que te gustaría feedback?

---

**¡Gracias por contribuir al proyecto!** 🙏 