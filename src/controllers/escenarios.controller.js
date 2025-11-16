// simulation.controller.js

// Importamos el servicio que manejará la lógica de extracción y cálculo de datos
const dataService = require('../services/data.service'); 

/**
 * RENDERIZA la pantalla P3: Configuración Base de Simulación.
 *
 * Esta función es la encargada de:
 * 1. Preparar/obtener todos los datos necesarios para la vista (lista de ítems,
 * métricas clave y datos del gráfico para el ítem seleccionado por defecto).
 * 2. Renderizar la plantilla EJS 'escenarios'.
 */
exports.renderPage = (req, res) => {
    try {
        // En un escenario real, aquí se obtendrían datos del ítem seleccionado
        // en la sesión o se usaría un valor por defecto.
        const defaultItemId = 'item2'; // 'Filtro de Aceite (Modelo X)' según el JSON

        // Simulación: Llamada al servicio para obtener todos los datos de la vista.
        const viewData = dataService.getSimulationBaseData(defaultItemId);

        // Renderiza la vista EJS, pasando los datos necesarios.
        // Aunque el EJS que me proporcionaste tiene datos hardcodeados,
        // una buena práctica es siempre pasar el objeto 'data' para el
        // futuro dinamismo (ej. para el nombre del usuario, el conteo de ítems, etc.)
        res.render('escenarios', {
            // Datos del header (Juan Perez, Rol, etc.)
            header: viewData.header,
            // Lista de ítems
            items: viewData.items,
            // Datos del gráfico y métricas para el ítem por defecto
            historicalData: viewData.historicalData,
            // ... otros datos que necesite el EJS
            fileStatus: viewData.fileStatus // Información de la carga del CSV
        });

    } catch (error) {
        console.error('Error al renderizar la pantalla de simulación base:', error);
        // Si hay un error crítico (ej. el archivo CSV no está cargado), redirigir o mostrar error.
        res.status(500).send('Error interno del servidor al cargar la configuración de simulación.');
    }
};

// Puedes añadir más funciones de controlador aquí, como endpoints para AJAX:
// exports.getHistoricalData = (req, res) => { ... } 
// exports.updateForecastHorizon = (req, res) => { ... }