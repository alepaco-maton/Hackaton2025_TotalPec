const express = require('express');
const path = require('path');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));



// AÑADE ESTAS DOS LÍNEAS PARA PARSEAR JSON Y DATOS DE FORMULARIO
app.use(express.json()); // Permite a Express leer cuerpos de petición en formato JSON
app.use(express.urlencoded({ extended: true })); // Para datos de formularios si fuera necesario

app.use('/', uploadRoutes);

module.exports = app;
