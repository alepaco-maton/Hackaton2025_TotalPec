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
        {"id": "item1", "name": "OUR10002030 - Brasil (Alto Volumen)"},
        {"id": "item2", "name": "OUR10003726 - Brasil (Pico Estacional)", "selected": true}, // Ítem por defecto
        {"id": "item3", "name": "NUE1200000 - Chile (Volumen Bajo)"},
        {"id": "item4", "name": "BIO130350 - Argentina (Proyección Alta)"},
        {"id": "item5", "name": "VTX5000000 - México (Volumen Muy Alto)"}
    ],
    // Datos detallados para cada ítem (Simulación de datos procesados)
    itemDetails: {
        "item2": { // OUR10003726 - Brasil (Pico Estacional)
            // Simulación de datos de gráfico (ventas y pronóstico - picos Q3/Q4)
            chartData: [
                {"x": "Sem 1", "y1": 100, "y2": 90},
                {"x": "Sem 2", "y1": 120, "y2": 110},
                {"x": "Sem 3", "y1": 150, "y2": 140},
                {"x": "Sem 4", "y1": 180, "y2": 170},
                // ... datos para 52 semanas
            ],
            // Métricas clave (Coherentes con 5200 unid/año)
            metrics: [
                {"label": "Total Units Sold (2023)", "value": "5,200", "highlight": true},
                {"label": "Average Weekly Sales", "value": "100", "highlight": true},
                {"label": "Peak Season", "value": "July-Aug", "icon": "info", "tooltip": "Basado en tendencias históricas"}
            ]
        },
        "item1": { // OUR10002030 - Brasil (Alto Volumen) - Bajo en estacionalidad
            chartData: [
                {"x": "Sem 1", "y1": 150, "y2": 155},
                {"x": "Sem 2", "y1": 155, "y2": 160},
                {"x": "Sem 3", "y1": 145, "y2": 150},
                {"x": "Sem 4", "y1": 160, "y2": 165},
            ],
            metrics: [
                {"label": "Total Units Sold (2023)", "value": "7,800"},
                {"label": "Average Weekly Sales", "value": "150"},
                {"label": "Peak Season", "value": "Oct-Nov"}
            ]
        },
        "item3": { // NUE1200000 - Chile (Volumen Bajo) - Estable
            chartData: [
                {"x": "Sem 1", "y1": 30, "y2": 35},
                {"x": "Sem 2", "y1": 35, "y2": 40},
                {"x": "Sem 3", "y1": 30, "y2": 35},
                {"x": "Sem 4", "y1": 40, "y2": 45},
            ],
            metrics: [
                {"label": "Total Units Sold (2023)", "value": "1,560"},
                {"label": "Average Weekly Sales", "value": "30"},
                {"label": "Peak Season", "value": "Mar-Apr"}
            ]
        },
        "item4": { // BIO130350 - Argentina (Proyección Alta) - Crecimiento Sostenido
            chartData: [
                {"x": "Sem 1", "y1": 80, "y2": 100},
                {"x": "Sem 2", "y1": 90, "y2": 110},
                {"x": "Sem 3", "y1": 100, "y2": 120},
                {"x": "Sem 4", "y1": 110, "y2": 130},
            ],
            metrics: [
                {"label": "Total Units Sold (2023)", "value": "4,680"},
                {"label": "Average Weekly Sales", "value": "90"},
                {"label": "Peak Season", "value": "Sep-Oct"}
            ]
        },
        "item5": { // VTX5000000 - México (Volumen Muy Alto) - Máxima Estabilidad
            chartData: [
                {"x": "Sem 1", "y1": 250, "y2": 255},
                {"x": "Sem 2", "y1": 260, "y2": 265},
                {"x": "Sem 3", "y1": 255, "y2": 260},
                {"x": "Sem 4", "y1": 270, "y2": 275},
            ],
            metrics: [
                {"label": "Total Units Sold (2023)", "value": "13,260"},
                {"label": "Average Weekly Sales", "value": "255"},
                {"label": "Peak Season", "value": "Dec-Jan"}
            ]
        }
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
        
        // Se calcula el promedio mensual a partir del semanal (x 4.33 semanas/mes)
        const avgWeeklySales = data.metrics.find(m => m.label === "Average Weekly Sales")?.value;
        const avgMonthlySales = avgWeeklySales ? Math.round(parseFloat(avgWeeklySales.replace(/,/g, '')) * 4.33) : 'N/A';
        
        return {
            ...data,
            metrics: data.metrics.map(metric => {
                if (metric.label === "Average Weekly Sales") {
                    return {"label": "Average Monthly Sales", "value": String(avgMonthlySales), "highlight": metric.highlight};
                }
                return metric;
            })
        };
    }

    return data;
};