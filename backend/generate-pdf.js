const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  // Ruta al archivo HTML
  const htmlPath = 'file://' + path.resolve(__dirname, 'swagger-doc.html');
  
  // Iniciar navegador
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  // Configurar viewport para PDF
  await page.setViewport({
    width: 1280,
    height: 800
  });
  
  // Navegar a la página HTML
  await page.goto(htmlPath, {
    waitUntil: 'networkidle0'
  });
  
  // Esperar a que la interfaz de Swagger se cargue
  await page.waitForSelector('#swagger-ui .swagger-ui .info');
  
  // Esperar un poco más para asegurar que todo se cargue
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Generar PDF
  await page.pdf({
    path: 'documentacion-api.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '20px',
      right: '20px',
      bottom: '20px',
      left: '20px'
    }
  });
  
  console.log('PDF generado correctamente: documentacion-api.pdf');
  
  // Cerrar navegador
  await browser.close();
})().catch(error => {
  console.error('Error al generar PDF:', error);
  process.exit(1);
}); 