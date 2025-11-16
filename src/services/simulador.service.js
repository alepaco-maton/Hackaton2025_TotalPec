// SIMULACIÓN DE DATOS DE BASE DE DATOS (MongoDB, Mongoose, etc.)
// En un entorno real, estas funciones harían consultas a la base de datos.
const MOCKED_SCENARIOS = [
    {
        scenarioId: 'A_Realista',
        name: 'A. Realista',
        status: 'Inactive',
        productId: 'Filtro_X',
        simulationData: {
            projectedSales: '2.0M', // Menos optimista
            totalRevenue: '$2.5M',
            estimatedCost: '$650K',
            grossMargin: '74.0%', // Margen menor
        },
        alerts: [
            { type: 'Alerta de Escases', message: 'Posible escasez en Q4 (Menor margen de seguridad).', severity: 'medium' },
            { type: 'Fluctuación de precios', message: 'Aumento del 5% en costo de materia prima para Q3.', severity: 'medium' }
        ],
        timeSeriesData: [100, 250, 400, 550, 700, 850, 1000, 1100, 1200, 1300, 1400, 1500]
    },
    {
        scenarioId: 'B_Optimista',
        name: 'B. Optimista',
        status: 'Active',
        productId: 'Filtro_X',
        // Datos del diseño
        simulationData: {
            projectedSales: '2.5M',
            totalRevenue: '$3.1M',
            estimatedCost: '$600K',
            grossMargin: '80.6%',
        },
        alerts: [
            { type: 'Advertencia de agotamiento', message: "Advertencia: Escasez 'Aceite' Q3-Q4 (Basado en Proyección B)", severity: 'high' },
            { type: 'Excedente de inventario', message: 'Exceso de Inventario: (45% Sobre el Plan Original)', severity: 'medium' }
        ],
        timeSeriesData: [150, 300, 500, 750, 1000, 1300, 1600, 2000, 2500, 3000, 3500, 3800]
    },
    {
        scenarioId: 'C_Conservador',
        name: 'C. Conservador',
        status: 'Inactive',
        productId: 'Filtro_X',
        // Datos conservadores
        simulationData: {
            projectedSales: '1.5M',
            totalRevenue: '$1.9M',
            estimatedCost: '$700K',
            grossMargin: '63.2%',
        },
        alerts: [
            { type: 'Demanda baja', message: 'Demanda 20% bajo el umbral de rentabilidad.', severity: 'high' },
            { type: 'Inventario alto', message: 'Alto stock sobrante al final del periodo (Costo de almacenamiento)', severity: 'medium' }
        ],
        timeSeriesData: [80, 180, 280, 380, 480, 580, 680, 780, 880, 980, 1080, 1180]
    },
];

// Datos del Plan Original, usado para la comparación en el gráfico
const ORIGINAL_PLAN_DATA = [120, 220, 350, 500, 650, 800, 950, 1150, 1350, 1550, 1750, 1950];
const HISTORICAL_DATA = [80, 180, 280, 380, 480, 580, 680, 780, 880, 980, 1080, 1180];
const MONTH_LABELS = ['Jan 2026', 'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026', 'Oct 2026', 'Nov 2026', 'Dec 2026'];


/**
 * Formatea los datos de series de tiempo de un escenario para el Chart.js.
 * Incluye siempre la comparación contra el Plan Original y Datos Históricos.
 * @param {object} scenario - El objeto escenario activo.
 * @returns {object} Objeto listo para ser consumido por Chart.js.
 */
function formatChartData(scenario) {
    // Definir colores para Light Mode
    const SCENARIO_COLOR = 'rgb(25, 118, 210)'; // Azul corporativo
    const PLAN_COLOR = 'rgb(255, 159, 64)'; // Naranja
    const HISTORICAL_COLOR = 'rgb(128, 128, 128)'; // Gris

    return {
        labels: MONTH_LABELS,
        datasets: [
            {
                label: `Selected Scenario (${scenario.name})`,
                data: scenario.timeSeriesData,
                color: SCENARIO_COLOR, 
            },
            {
                label: 'Original Plan (2024)',
                data: ORIGINAL_PLAN_DATA,
                borderDash: [5, 5],
                color: PLAN_COLOR, 
            },
            {
                label: 'Ventas Históricas',
                data: HISTORICAL_DATA,
                borderDash: [2, 2],
                pointRadius: 2,
                color: HISTORICAL_COLOR, 
            }
        ],
    };
}


/**
 * Obtiene todos los escenarios y marca cuál es el activo.
 * @returns {object} { scenarios, activeScenario, chartData }
 */
async function getSimulationData() {
    const activeScenario = MOCKED_SCENARIOS.find(s => s.status === 'Active') || MOCKED_SCENARIOS[1];
    const scenarios = MOCKED_SCENARIOS.map(s => ({
        scenarioId: s.scenarioId,
        name: s.name,
        status: s.status
    }));

    return {
        scenarios: scenarios,
        activeScenario: activeScenario,
        chartData: formatChartData(activeScenario),
    };
}

/**
 * Cambia el escenario activo y devuelve sus datos.
 * @param {string} scenarioId - ID del escenario a activar.
 * @returns {object} { activeScenario, chartData } del nuevo escenario activo.
 */
async function setActiveScenario(scenarioId) {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 300));

    const newActiveScenario = MOCKED_SCENARIOS.find(s => s.scenarioId === scenarioId);

    if (!newActiveScenario) {
        throw new Error('Escenario no encontrado.');
    }

    // Lógica de activación simulada:
    MOCKED_SCENARIOS.forEach(s => {
        s.status = s.scenarioId === scenarioId ? 'Active' : 'Inactive';
    });

    return {
        activeScenario: newActiveScenario,
        chartData: formatChartData(newActiveScenario),
    };
}

/**
 * Procesa la decisión final del usuario.
 * @param {string} scenarioId - ID del escenario seleccionado.
 * @returns {object} Resultado de la acción.
 */
async function finalizeSimulation(scenarioId) {
    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Verificar si el ID es el activo
    const activeScenario = MOCKED_SCENARIOS.find(s => s.status === 'Active');
    
    if (!activeScenario || activeScenario.scenarioId !== scenarioId) {
        throw new Error('El escenario a finalizar no coincide con el escenario activo actualmente.');
    }

    // 2. Ejecutar lógica de confirmación
    console.log(`[SERVICE] Escenario ${scenarioId} seleccionado. Disparando proceso de reporte final.`);
    
    return { success: true, message: 'Plan de simulación finalizado y proceso de reporte iniciado.' };
}




module.exports = {
    getSimulationData,
    setActiveScenario,
    finalizeSimulation,
    // AÑADE ESTA LÍNEA: Exportar el objeto MOCKED_SCENARIOS
    MOCKED_SCENARIOS, 
};