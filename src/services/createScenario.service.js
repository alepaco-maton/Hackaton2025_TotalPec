// createScenario.service.js

/**
 * Simulación de datos de configuración de escenarios base.
 * En un sistema real, esto se cargaría de la base de datos o de la sesión.
 */
const SCENARIO_CONFIG_DEFAULTS = {
    // Escenario 1: Realista (Base: continúa tendencias)
    realista: {
        id: "realista",
        label: "Escenario Realista",
        precioVenta: 15.00, // $
        tasaCrecimiento: 5,   // %
        promociones: -2,     // % (descuento)
        costoItem: 8.00,     // $
        stockInicial: 1500,  // Unidades
    },
    // Escenario 2: Optimista (Mayor precio/demanda, menor costo/promociones)
    optimista: {
        id: "optimista",
        label: "Escenario Optimista",
        precioVenta: 16.50,
        tasaCrecimiento: 10,
        promociones: -1,
        costoItem: 7.50,
        stockInicial: 2000,
    },
    // Escenario 3: Conservador (Menor precio/demanda, mayor costo/promociones)
    conservador: {
        id: "conservador",
        label: "Escenario Conservador",
        precioVenta: 14.00,
        tasaCrecimiento: 0,
        promociones: -5,
        costoItem: 9.00,
        stockInicial: 1000,
    },
};

/**
 * Obtiene la estructura completa de datos para renderizar la vista P4.
 */
exports.getScenarioCreationData = (selectedItem = "Filtro de Aceite (Modelo X)") => {
    return {
        header: {
            title: "Simulador de Ventas y Compras",
            userName: "Juan Perez",
            userRole: "Gerente de Línea"
        },
        subHeader: {
            status: `Configurando escenarios para: ${selectedItem}`,
            context: "Horizonte de pronóstico: 3 Meses | Simulación Semanal"
        },
        // Se cargan los escenarios por defecto para la primera visualización
        scenarios: SCENARIO_CONFIG_DEFAULTS,
        tabs: [
            {"id": "realista", "label": "Escenario Realista", "default": true},
            {"id": "optimista", "label": "Escenario Optimista"},
            {"id": "conservador", "label": "Escenario Conservador"},
            {"id": "custom", "label": "+ Nuevo Escenario"}
        ],
        summary: {
            precioVentaBase: 15.00,
            costoItemBase: 8.00,
            tasaCrecimientoHistorica: 3.5
        }
    };
};

/**
 * Guarda o actualiza la configuración de un escenario en particular.
 * (Simulación: En un entorno real se haría un update en la DB/Session)
 */
exports.updateScenarioConfig = (scenarioId, config) => {
    if (SCENARIO_CONFIG_DEFAULTS[scenarioId]) {
        SCENARIO_CONFIG_DEFAULTS[scenarioId] = { ...SCENARIO_CONFIG_DEFAULTS[scenarioId], ...config };
        return { success: true, message: `Configuración de ${scenarioId} guardada.` };
    }
    return { success: false, message: `Escenario ${scenarioId} no encontrado.` };
};

/**
 * Obtiene la configuración para un ID de escenario específico.
 */
exports.getScenarioConfig = (scenarioId) => {
    return SCENARIO_CONFIG_DEFAULTS[scenarioId] || null;
};