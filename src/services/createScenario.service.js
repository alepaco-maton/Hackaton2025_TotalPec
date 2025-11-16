/**
 * Simulación de datos de configuración de escenarios base.
 * Los valores base (Precio, Costo, Crecimiento) reflejan el ítem
 * OUR10002030 (Batería Premium), un producto de alto valor y estacionalidad.
 */
const SCENARIO_CONFIG_DEFAULTS = {
    // Escenario 1: Realista (Base: continúa tendencias estacionales con ligero crecimiento)
    realista: {
        id: "realista",
        label: "Escenario Realista",
        precioVenta: 80.00,   // Precio base más alto para Batería Premium
        tasaCrecimiento: 3,   // % (Crecimiento de la demanda)
        promociones: -3,     // % (Descuento promedio moderado)
        costoItem: 55.00,    // Costo base más alto
        stockInicial: 2500,  // Unidades (Stock inicial moderado, cubriendo pico con margen)
    },
    // Escenario 2: Optimista (Mayor margen/demanda, menor costo y alto stock para asegurar pico)
    optimista: {
        id: "optimista",
        label: "Escenario Optimista",
        precioVenta: 85.00, // Se asume que se puede subir el precio o que la demanda lo permite
        tasaCrecimiento: 8, // Se espera un pico de demanda estacional más fuerte de lo normal
        promociones: -1,   // Se usa menos promoción, mayor margen
        costoItem: 53.00, // Se consigue una mejor negociación con el proveedor
        stockInicial: 3500, // Alto stock para asegurar que no haya quiebre de stock en el pico
    },
    // Escenario 3: Conservador (Menor precio/demanda, mayor costo y bajo stock por riesgo)
    conservador: {
        id: "conservador",
        label: "Escenario Conservador",
        precioVenta: 75.00, // Se baja el precio ante posible competencia
        tasaCrecimiento: 0, // Crecimiento nulo/estancamiento del mercado
        promociones: -5,   // Mayor descuento para mover inventario
        costoItem: 58.00, // Aumento en el costo logístico o de materia prima
        stockInicial: 1800, // Stock bajo para minimizar el riesgo de inventario obsoleto o lento
    },
};

/**
 * Obtiene la estructura completa de datos para renderizar la vista P4.
 *
 * @param {string} selectedItem - Nombre del ítem seleccionado.
 * @returns {object} Datos estructurados para la vista.
 */
exports.getScenarioCreationData = (selectedItem = "Batería Premium (Modelo Y) - OUR10002030") => {
    // Usamos la configuración de variables del escenario 'realista' como plantilla base
    const baseVariablesTemplate = Object.keys(SCENARIO_CONFIG_DEFAULTS.realista).map(key => {
        if (key === 'id' || key === 'label') return null; 

        let label, unit, placeholder, isDelta, type;
        
        switch (key) {
            case 'precioVenta':
                label = "Precio de Venta";
                unit = "$";
                placeholder = `Precio base actual: $${SCENARIO_CONFIG_DEFAULTS.realista.precioVenta.toFixed(2)}`;
                type = "currencyInput";
                isDelta = false;
                break;
            case 'tasaCrecimiento':
                label = "Demanda / Tasa de Crecimiento";
                unit = "%";
                placeholder = "Ej: +2.5% vs. año anterior";
                type = "percentageInput";
                isDelta = true;
                break;
            case 'promociones':
                label = "Promociones (Descuento Promedio)";
                unit = "%";
                placeholder = "Ej: -3% de descuento promedio";
                type = "percentageInput";
                isDelta = true;
                break;
            case 'costoItem':
                label = "Costo por Ítem (Variable)";
                unit = "$";
                placeholder = `Costo actual: $${SCENARIO_CONFIG_DEFAULTS.realista.costoItem.toFixed(2)}`;
                type = "currencyInput";
                isDelta = false;
                break;
            case 'stockInicial':
                label = "Inventario / Stock Inicial";
                unit = "Unidades";
                placeholder = "Ej: 2,500 unidades";
                type = "unitInput";
                isDelta = false;
                break;
            default:
                return null;
        }

        return { id: key, label, type, unit, placeholder, isDelta };
    }).filter(v => v !== null);

    // Mapeamos los datos de SCENARIO_CONFIG_DEFAULTS para la estructura del front-end
    const scenariosForView = Object.values(SCENARIO_CONFIG_DEFAULTS).map((config) => {
        const scenarioVariables = baseVariablesTemplate.map(template => ({
            ...template,
            currentValue: config[template.id] // Usamos el valor actual de la config
        }));
        
        return {
            id: config.id,
            label: config.label,
            default: config.id === 'realista',
            variables: scenarioVariables
        };
    });

    return {
        header: {
            title: "3. Simulador de Ventas y Compras",
            userName: "David Padilla",
            userRole: "Gerente de Línea"
        },
        subHeader: {
            status: `Configurando escenarios para: ${selectedItem}`,
            context: "Horizonte de pronóstico: 3 Meses | Simulación Semanal"
        },
        scenarios: scenariosForView,
        summaryMetrics: [
            { label: "Precio de Venta Base:", value: `$${SCENARIO_CONFIG_DEFAULTS.realista.precioVenta.toFixed(2)}` },
            { label: "Costo por Ítem Base:", value: `$${SCENARIO_CONFIG_DEFAULTS.realista.costoItem.toFixed(2)}` },
            { label: "Tasa de Crecimiento Histórica:", value: "+2.5% (anual)" },
            { label: "Ventas Promedio Semanal:", value: "144 Unidades" }
        ]
    };
};

/**
 * Guarda o actualiza la configuración de un escenario en particular.
 * (Simulación: En un entorno real se haría un update en la DB/Session)
 *
 * @param {string} scenarioId - ID del escenario a actualizar.
 * @param {object} config - Objeto con los nuevos valores (ej: { precioVenta: 82.00 }).
 * @returns {object} Resultado de la operación.
 */
exports.updateScenarioConfig = (scenarioId, config) => {
    if (SCENARIO_CONFIG_DEFAULTS[scenarioId]) {
        // Aseguramos que solo actualizamos las claves de variables que existen
        Object.keys(config).forEach(key => {
            if (SCENARIO_CONFIG_DEFAULTS[scenarioId].hasOwnProperty(key)) {
                SCENARIO_CONFIG_DEFAULTS[scenarioId][key] = config[key];
            }
        });
        return { success: true, message: `Configuración de ${scenarioId} guardada.` };
    }
    return { success: false, message: `Escenario ${scenarioId} no encontrado.` };
};

/**
 * Obtiene la configuración para un ID de escenario específico.
 *
 * @param {string} scenarioId - ID del escenario.
 * @returns {object|null} Configuración del escenario o null si no existe.
 */
exports.getScenarioConfig = (scenarioId) => {
    return SCENARIO_CONFIG_DEFAULTS[scenarioId] || null;
};