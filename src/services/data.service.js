// data.service.js

// ---------------------------------------------------------------------
// 1. DATA HISTÓRICA SIMULADA (Basado en el JSON proporcionado)
// ---------------------------------------------------------------------

/**
 * Simulación de la base de datos o datos cargados en memoria
 * tras procesar el archivo CSV.
 */
const HISTORICAL_DB = {
    // Datos globales de la aplicación
    header: {
        title: "Simulador de Ventas y Compras",
        userName: "Juan Perez",
        userRole: "Gerente de Línea"
    },
    // Estatus de la carga (reutilizado del JSON)
    fileStatus: {
        title: "1. Archivo Cargado: Ventas2023_Q3.csv",
        message: "Éxito de Carga: Datos históricos listos. El archivo contiene información de 250 ítems."
    },
    // Lista completa de ítems
    items: [
        {"id": "item1", "name": "OUR10002030 - Brasil"},
        {"id": "item2", "name": "OUR10003726 - Brasil", "selected": true}, // Ítem por defecto
        {"id": "item3", "name": "OUR10003812 - Brasil"},
        {"id": "item4", "name": "BIO130350 - Argentina"},
        {"id": "item5", "name": "OUR10003727 - Brasil"},
        {"id": "item6", "name": "OUR10002029 - Brasil"}
    ],
    // Datos detallados para cada ítem (Simulación de datos procesados)
    itemDetails: {
        "item2": { // Filtro de Aceite (Modelo X)
            // Simulación de datos de gráfico (ventas y pronóstico)
            chartData: [
                {"x": "Sem 1", "y1": 100, "y2": 80},
                {"x": "Sem 2", "y1": 200, "y2": 120},
                {"x": "Sem 3", "y1": 500, "y2": 300},
                {"x": "Sem 4", "y1": 700, "y2": 600},
                // ... datos para 52 semanas
            ],
            // Métricas clave
            metrics: [
                {"label": "Total Units Sold (2023)", "value": "5,200", "highlight": true},
                {"label": "Average Weekly Sales", "value": "100", "highlight": true},
                {"label": "Peak Season", "value": "July-Aug", "icon": "info", "tooltip": "Basado en tendencias históricas"}
            ]
        },
        "item1": { // Aceite Sintético 5W-40 - 1L
            chartData: [
                {"x": "Sem 1", "y1": 800, "y2": 750},
                {"x": "Sem 2", "y1": 780, "y2": 800},
                // ...
            ],
            metrics: [
                {"label": "Total Units Sold (2023)", "value": "35,000"},
                {"label": "Average Weekly Sales", "value": "673"},
                {"label": "Peak Season", "value": "Oct-Nov"}
            ]
        }
        // ... detalles para otros ítems
    }
};

// ---------------------------------------------------------------------
// 2. FUNCIONES DE SERVICIO
// ---------------------------------------------------------------------

/**
 * Obtiene todos los datos necesarios para la pantalla P3 de configuración base.
 * @param {string} defaultItemId - El ID del ítem que debe mostrarse por defecto.
 * @returns {object} Un objeto con todos los datos procesados para la vista.
 */
exports.getSimulationBaseData = (defaultItemId) => {
    // 1. Obtener la lista de ítems (puede ser filtrada o con el estado de selección)
    const items = HISTORICAL_DB.items.map(item => ({
        ...item,
        selected: item.id === defaultItemId // Asegura que el ítem por defecto esté marcado como seleccionado
    }));

    // 2. Obtener los datos históricos del ítem por defecto
    const historicalData = HISTORICAL_DB.itemDetails[defaultItemId];

    // 3. Devolver el objeto de datos completo
    return {
        header: HISTORICAL_DB.header,
        fileStatus: HISTORICAL_DB.fileStatus,
        items: items,
        historicalData: historicalData,
        // Configuración por defecto (simulada)
        scenarioConfig: {
            forecastHorizon: "3 Meses",
            applyTrendSeasonality: true
        }
    };
};

/**
 * Obtiene los datos del gráfico y las métricas para un ítem específico.
 * @param {string} itemId - El ID del ítem solicitado.
 * @param {string} granularity - La granularidad ('weekly' o 'monthly').
 * @returns {object|null} Los datos históricos o nulo si no se encuentra.
 */
exports.getItemHistoricalData = (itemId, granularity = 'weekly') => {
    // En una implementación real, aquí se consultaría la DB y se agregaría
    // la data según la 'granularidad' (semanal o mensual).
    
    // Por ahora, solo devolvemos los datos simulados:
    const data = HISTORICAL_DB.itemDetails[itemId];
    
    // Simulación de cambio de granularidad (solo para demostración lógica)
    if (data && granularity === 'monthly') {
        // En un caso real, la chartData cambiaría a puntos mensuales.
        // Aquí simulamos que sí tenemos la data.
        return {
            ...data,
            metrics: [
                {"label": "Total Units Sold (2023)", "value": "5,200"},
                {"label": "Average Monthly Sales", "value": "433"}, // Promedio mensual
                {"label": "Peak Season", "value": "July-Aug"}
            ]
        };
    }

    return data;
};