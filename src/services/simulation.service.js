// src/services/simulation.service.js
// Archivo de servicio para la simulación y reportes finales.

// 1. DEPENDENCIA CRÍTICA: Importamos MOCKED_SCENARIOS para el cálculo del escenario óptimo
const { MOCKED_SCENARIOS } = require('./simulador.service'); 

// 2. DATOS MOCK DE REPORTE (Asegurar que existan como 'const')
const MOCKED_PURCHASE_SUGGESTIONS = [
    { 
        item: "Aceite Sintético", 
        stock: 450, 
        demand: 1200, 
        suggestion: 750, 
        date: "2024-03-15" 
    },
    { 
        item: "Slick Actual", 
        stock: 450, 
        demand: 500, 
        suggestion: 750, 
        date: "2024-03-16" 
    },
    { 
        item: "Filtro de Aceite", 
        stock: 120, 
        demand: 500, 
        suggestion: 380, 
        date: "2024-03-10" 
    },
    { 
        item: "Filtro de Aceite", 
        stock: 120, 
        demand: 500, 
        suggestion: 380, 
        date: "2024-03-10" 
    }
];

const MOCKED_JUSTIFICATION = {
    selectionLogic: "El escenario Optimista fue selecatado porque offer 18% de incremento en 18% de Margen Bruto, superar al Realista, con un solo moación de la rigesgo manejable de quiebre de stock en solo el 5% de semanas.",
    mitigation: "El stock sugerido evita 85% de competas de alerta sobre-inventario glendo generado en san escenario Conservador."
};


/**
 * Obtiene todos los datos necesarios para la pantalla de Decisión Ejecutiva.
 * @returns {object} Todos los datos del reporte.
 */
async function getFinalReportData() {
    // Busca el escenario activo o usa el segundo (Optimista) como fallback
    const optimalScenario = MOCKED_SCENARIOS.find(s => s.status === 'Active') || MOCKED_SCENARIOS[1];

    return {
        // Componente: optimal_scenario_recommendation
        recommendation: {
            scenario: "Optimista - Máxima Rentabilidad",
            impact: "+$2.5M Ingreso Neto (+18% vs. Año Anterior)"
        },
        // Componente: justification_rationale
        rationale: MOCKED_JUSTIFICATION,
        
        // Componente: actionable_purchase_report
        purchaseReport: MOCKED_PURCHASE_SUGGESTIONS,
    };
}

module.exports = {
    getFinalReportData,
    // (Incluye otras funciones de simulación si son necesarias en este archivo)
};