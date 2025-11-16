const { Router } = require('express');
const multer = require('multer');
const uploadController = require('../controllers/upload.controller');
const express = require('express');
const { requireAuth } = require('../controllers/login.controller');

const escenariosController = require('../controllers/escenarios.controller'); 
const createscenarioController = require('../controllers/createScenario.controller'); 
const simuladorController = require('../controllers/simulador.controller'); 


const router = Router();

// --- Configuración de Multer ---
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (_, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});

// Configuración de Multer con límites y filtro de tipo de archivo
const upload = multer({ 
    storage,
    limits: { 
        fileSize: 1024 * 1024 * 10 // Limite a 10MB
    },
    fileFilter: (_, file, cb) => {
        if (file.mimetype !== 'text/csv') {
            return cb(new Error('Solo se permiten archivos CSV'), false);
        }
        cb(null, true);
    }
});


// ---------------------------------------------------------------------
// --- Rutas de Carga de Datos (Upload) ---
// ---------------------------------------------------------------------

router.get('/', (req, res) => {
    res.redirect('/cargar-datos');
});

router.get('/cargar-datos', requireAuth, uploadController.renderPage);

// Ruta POST para la subida de CSV con manejo de errores de Multer
router.post('/upload-csv', requireAuth, (req, res, next) => {
    upload.single('csvFile')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // Error de Multer (ej. archivo muy grande)
            return res.status(400).json({ error: `Error de carga: ${err.message}` });
        } else if (err) {
            // Otros errores (ej. FileFilter)
            return res.status(400).json({ error: err.message });
        }
        // Si no hay errores, continuar al controlador
        next();
    });
}, uploadController.processCSV);

// La ruta de previsualización ahora probablemente lleva a la de escenarios
router.get('/previsualizacion', requireAuth, (req, res) => {
    // Redirigimos a la nueva pantalla de configuración de escenarios
    res.redirect('/escenarios'); 
});


// ---------------------------------------------------------------------
// --- Rutas de Escenarios de Venta ---
// ---------------------------------------------------------------------

// Ruta para renderizar la nueva página de configuración de escenarios
router.get('/escenarios', requireAuth, escenariosController.renderPage);
 
// Ruta para renderizar la nueva página de configuración de escenarios
router.get('/configurescenarios', requireAuth, createscenarioController.renderPage);

router.get('/simulador', requireAuth, simuladorController.renderPage);
router.get('/api/simulador/scenario/:scenarioId', requireAuth, simuladorController.loadScenarioAPI);


const reportsController = require('../controllers/reports.controller');

// Ruta para la pantalla principal de reportes
router.get('/reports/final', requireAuth, reportsController.renderFinalReport);

// Ruta para la exportación (GET es suficiente para descargas de reportes)
router.get('/reports/export/purchases', requireAuth, reportsController.exportPurchaseSuggestion);

// 🚨 SOLUCIÓN: Añadir la ruta de finalización
// Generalmente se usa POST para acciones de confirmación o cambio de estado.
router.post('/api/simulador/finalize', requireAuth, simuladorController.finalizeSimulationAPI);

module.exports = router;