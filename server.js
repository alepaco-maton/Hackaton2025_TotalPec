const app = require('./src/app');
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});


// 🚨 SOLUCIÓN AL ERROR 'req.body' UNDEFINED 🚨
// 1. Middleware para parsear JSON (para llamadas AJAX/API)
app.use(express.json()); 
// 2. Middleware para parsear URL-encoded (si envías datos de formularios HTML)
app.use(express.urlencoded({ extended: true })); 
 