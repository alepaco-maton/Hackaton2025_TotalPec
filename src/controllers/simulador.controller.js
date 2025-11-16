const simuladorService = require('../services/simulador.service');

/**
 * RENDERIZA la pantalla P4: Simulation Results.
 * [GET] /simulador/
 */
exports.renderPage = async (req, res) => {
    try {
        // Llama al servicio para obtener todos los datos necesarios para la vista inicial:
        // { scenarios, activeScenario, chartData }
        const viewData = await simuladorService.getSimulationData();
        
        // Pasa los datos a la vista EJS (asumiendo que el nombre del archivo EJS es 'simulador')
        res.render('simulador', {
            scenarios: viewData.scenarios,
            activeScenario: viewData.activeScenario,
            chartData: viewData.chartData,
            // layout: 'main' // Comentar o borrar si lo manejas en otro lado
        });

    } catch (error) {
        console.error('Error al renderizar la pantalla de resultados de simulación:', error.message);
        res.status(500).send('Error interno del servidor al cargar los datos de simulación.');
    }
};

/**
 * API para cargar un escenario específico y marcarlo como activo.
 * Usado por AJAX/fetch en simulador.js.
 * [GET] /api/simulador/scenario/:scenarioId
 */
exports.loadScenarioAPI = async (req, res) => {
    try {
        const scenarioId = req.params.scenarioId;
        
        // Llama al servicio para cambiar el estado y obtener los datos
        // Devuelve { activeScenario, chartData }
        const data = await simuladorService.setActiveScenario(scenarioId);

        // Envía la respuesta JSON al cliente (simulador.js)
        res.status(200).json(data);

    } catch (error) {
        console.error('Error al cambiar de escenario:', error.message);
        res.status(404).json({ message: error.message });
    }
};

/**
 * API para confirmar el escenario seleccionado y avanzar al siguiente paso.
 * Usado por AJAX/fetch en simulador.js.
 * [POST] /api/simulador/finalize
 */
exports.finalizeSimulationAPI = async (req, res) => {
    try {
        const { scenarioId } = req.body;

        if (!scenarioId) {
            return res.status(400).json({ error: 'Falta el parámetro scenarioId en el cuerpo de la petición.' });
        }
        
        // Llama al servicio para procesar la decisión final
        const result = await simuladorService.finalizeSimulation(scenarioId);

        res.status(200).json(result);

    } catch (error) {
        console.error('Error al finalizar la simulación:', error.message);
        // Si el servicio lanza un error 400 (ej. escenario no coincide), lo reflejamos
        const statusCode = error.message.includes('coincide') ? 400 : 500;
        res.status(statusCode).json({ error: error.message });
    }
};