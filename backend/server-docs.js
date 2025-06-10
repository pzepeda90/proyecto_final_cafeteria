const express = require('express');
const path = require('path');
const fs = require('fs');

// Crear la app Express
const app = express();
const PORT = 8090;

// Crear una página HTML mejorada para imprimir
const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>API Cafetería El Bandito - Documentación</title>
  <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.6.2/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
    body { margin: 0; background: #fafafa; }
    @media print {
      .swagger-ui .opblock-body, .swagger-ui .opblock-description-wrapper {
        display: block !important;
      }
      .swagger-ui .opblock, .swagger-ui .info {
        page-break-inside: avoid;
      }
      .swagger-ui .parameters-container, .swagger-ui .responses-container {
        page-break-inside: avoid;
      }
      /* Asegurarse de que todo se expanda en el PDF */
      .swagger-ui .expand-methods, .swagger-ui .expand-operation {
        display: none;
      }
      .swagger-ui .opblock-summary-control:checked ~ .opblock-body { 
        display: block; 
      }
      /* Ocultar cosas innecesarias en la impresión */
      .swagger-ui .auth-wrapper, .swagger-ui .information-container .servers,
      .swagger-ui .schemes-container, .swagger-ui .opblock-summary-control,
      .swagger-ui .try-out, .swagger-ui .opblock-summary__toggle {
        display: none;
      }
      /* Forzar que se muestren todas las operaciones */
      .swagger-ui .opblock-tag-section {
        display: block !important;
      }
      .swagger-ui .opblock {
        margin-top: 10px;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.6.2/swagger-ui-bundle.js" charset="UTF-8"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: "http://localhost:8080/api-docs/swagger.json",
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis
        ],
        layout: "BaseLayout",
        docExpansion: "full",
        defaultModelsExpandDepth: 3,
        defaultModelExpandDepth: 3,
        filter: true
      });
      
      // Expandir todos los endpoints para el PDF
      setTimeout(() => {
        const expandButtons = document.querySelectorAll('.opblock-tag');
        expandButtons.forEach(btn => {
          if (btn.querySelector('.arrow').classList.contains('arrow-down')) {
            btn.click();
          }
        });
        console.log('Documentación expandida y lista para imprimir');
      }, 2000);
    };
  </script>
</body>
</html>
`;

// Ruta principal que muestra la documentación
app.get('/', (req, res) => {
  res.send(html);
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor de documentación ejecutándose en http://localhost:${PORT}`);
  console.log('');
  console.log('INSTRUCCIONES:');
  console.log('1. Abre la URL http://localhost:8090 en tu navegador');
  console.log('2. Espera unos segundos a que la documentación se cargue completamente');
  console.log('3. Usa Ctrl+P (Windows/Linux) o Cmd+P (Mac) para imprimir la página');
  console.log('4. Selecciona "Guardar como PDF" en el diálogo de impresión');
  console.log('5. Presiona Ctrl+C en esta terminal cuando hayas terminado');
}); 