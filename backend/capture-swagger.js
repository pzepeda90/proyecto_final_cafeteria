const fs = require('fs');
const path = require('path');

// Crear un archivo HTML que utilice la API directamente
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
      .swagger-ui select {
        -webkit-appearance: none;
        appearance: none;
      }
      .swagger-ui input[type=text] {
        border: 1px solid #ccc;
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
        defaultModelExpandDepth: 3
      });
      
      // Script para imprimir automáticamente
      setTimeout(() => {
        // Si estás viendo esto en el navegador, puedes imprimir manualmente
        // o usar Ctrl+P/Cmd+P para guardar como PDF
        console.log('Documentación cargada. Lista para imprimir como PDF.');
      }, 3000);
    };
  </script>
</body>
</html>
`;

fs.writeFileSync(path.join(__dirname, 'swagger-para-imprimir.html'), html);
console.log('Se ha creado el archivo "swagger-para-imprimir.html"');
console.log('Abre este archivo en un navegador y usa la función de imprimir (Ctrl+P o Cmd+P) para guardarlo como PDF'); 