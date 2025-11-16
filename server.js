const express = require('express');
const app = require('./src/app');

const PORT = process.env.PORT || 3000;

// Middlewares para parsear body (JSON y formularios)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
 