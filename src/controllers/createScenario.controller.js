// createScenario.controller.js

const scenarioService = require('../services/createScenario.service');

/**
 * RENDERIZA la pantalla P4: Creación y Definición de Escenarios.
 */
exports.renderPage = (req, res) => {
    try {
        // En un caso real, el 'selectedItem' se pasaría desde P3 (session/query param).
        // Aquí usamos un valor por defecto.
        const viewData = scenarioService.getScenarioCreationData(); 

        res.render('configurescenarios', {
            ...viewData,
            // Pasar la configuración de todos los escenarios, el JS de cliente se encargará de mostrarlos
            allScenarios: viewData.scenarios, 
        });

    } catch (error) {
        console.error('Error al renderizar la pantalla de creación de escenarios:', error);
        res.status(500).send('Error interno del servidor al cargar la configuración de escenarios.');
    }
};

/**
 * API para AJAX: Guarda la configuración de un escenario.
 */
exports.saveScenarioConfig = (req, res) => {
    const { scenarioId, config } = req.body;
    if (!scenarioId || !config) {
        return res.status(400).json({ error: 'Faltan parámetros: scenarioId y config.' });
    }

    const result = scenarioService.updateScenarioConfig(scenarioId, config);
    if (result.success) {
        return res.json({ success: true, message: result.message });
    } else {
        return res.status(404).json({ error: result.message });
    }
};
