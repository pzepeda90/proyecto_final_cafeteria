const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Servidor de prueba funcionando correctamente');
});

app.listen(PORT, () => {
  console.log(`Servidor de prueba iniciado en http://localhost:${PORT}`);
}); 