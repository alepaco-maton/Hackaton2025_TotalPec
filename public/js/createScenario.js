/**
 * Lógica de Interacción para la Creación y Definición de Escenarios
 * Gestiona el cambio de pestañas, la actualización de inputs y la simulación de guardado de datos.
 */

// ... (Código de inicialización y constantes se mantiene igual) ...

if (typeof window.appData === 'undefined') {
    console.error("Error: appData no está definido. Verifique el script de inicialización en index.ejs.");
}

// Objeto para almacenar la configuración *actual* de todos los escenarios
const scenarioData = {}; 
const initialScenarios = window.appData.scenarios;
let activeScenarioId = initialScenarios.find(s => s.default)?.id || initialScenarios[0].id; // Aseguramos un ID

const $scenarioTabs = document.getElementById('scenarioTabs');
const $variableGroup = document.getElementById('variableGroup');
const $currentScenarioTitle = document.getElementById('currentScenarioTitle');
const $generateProjectionsBtn = document.getElementById('generateProjectionsBtn');

// Contador para IDs de nuevos escenarios
let scenarioCounter = initialScenarios.length + 1;

// ... (Funciones initializeData, generateVariableHTML y renderScenarioPanel se mantienen igual) ...

/**
 * Inicializa el estado de los datos al cargar la página.
 * Copia los valores iniciales en la estructura de datos para seguimiento.
 */
function initializeData() {
    initialScenarios.forEach(scenario => {
        scenarioData[scenario.id] = {
            label: scenario.label,
            // Mapea las variables para un acceso más fácil
            variables: scenario.variables.reduce((acc, v) => {
                acc[v.id] = v.currentValue;
                return acc;
            }, {})
        };
    });
    console.log("Datos de escenarios inicializados:", scenarioData);
}

/**
 * Genera el HTML para los inputs de un escenario dado basado en su estado actual.
 * @param {Object[]} variablesTemplate - Array de objetos de variables con metadata.
 * @returns {string} HTML de los inputs.
 */
function generateVariableHTML(variablesTemplate) {
    let html = '';
    const currentVariablesState = scenarioData[activeScenarioId].variables;

    // Usamos el template (variablesTemplate) para la metadata y el estado (currentVariablesState) para el valor
    variablesTemplate.forEach(variable => {
        const currentValue = currentVariablesState[variable.id];
        
        // Determina una descripción de impacto simplificada para el hint
        const impact = variable.id.includes('Venta') || variable.id.includes('Promociones') ? 'Ingresos' : variable.id.includes('Costo') ? 'Costos' : 'Inventario';

        html += `
            <div class="input-container" data-variable-id="${variable.id}" data-variable-type="${variable.type}">
                <label for="${variable.id}">${variable.label}</label>
                <div class="input-field-group">
                    <input
                        type="number"
                        id="${variable.id}"
                        value="${currentValue}"
                        placeholder="${variable.placeholder}"
                        data-unit="${variable.unit}"
                        step="any"
                    />
                    <span class="unit">${variable.unit}</span>
                </div>
                <small class="behavior-hint">Afecta directamente los **${impact}**.</small>
            </div>
        `;
    });
    return html;
}

/**
 * Renderiza el panel de variables para el escenario activo.
 */
function renderScenarioPanel() {
    const activeScenarioConfig = initialScenarios.find(s => s.id === activeScenarioId);

    if (!activeScenarioConfig) {
        $variableGroup.innerHTML = '<p>No se encontró la configuración para este escenario.</p>';
        return;
    }

    $currentScenarioTitle.textContent = activeScenarioConfig.label;
    $variableGroup.innerHTML = generateVariableHTML(activeScenarioConfig.variables);

    // Adjuntar listeners de eventos a los nuevos inputs
    $variableGroup.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('input', handleVariableChange);
    });

    console.log(`Panel de escenario renderizado para: ${activeScenarioId}`);
}

/**
 * Maneja el cambio de una variable de input (simula el guardado automático).
 * @param {Event} event - Evento de input.
 */
function handleVariableChange(event) {
    const input = event.target;
    const variableId = input.id;
    const newValue = parseFloat(input.value);

    // Validación: asegurarse de que sea un número válido
    if (isNaN(newValue)) {
        input.classList.add('input-error');
        console.warn(`Valor no numérico para ${variableId}.`);
        return;
    }
    input.classList.remove('input-error');

    // Actualizar el estado interno (simulación de guardado en la BD)
    if (scenarioData[activeScenarioId]) {
        scenarioData[activeScenarioId].variables[variableId] = newValue;
        console.log(`Guardado automático simulado para ${activeScenarioId} - ${variableId}: ${newValue}`);
        // NOTA: Aquí se enviaría la petición PUT/PATCH al servidor de Node.js
    }
}

// -----------------------------------------------------------
// --- NUEVAS FUNCIONES PARA CREACIÓN DE ESCENARIO ---

/**
 * Crea una nueva pestaña de escenario en el DOM antes del botón '+ Nuevo Escenario'.
 * @param {string} id - ID único del escenario.
 * @param {string} label - Etiqueta a mostrar.
 */
function renderNewTab(id, label) {
    const newTabButton = document.createElement('button');
    newTabButton.className = 'tab-button';
    newTabButton.dataset.scenarioId = id;
    newTabButton.textContent = label;

    const newScenarioButton = document.getElementById('newScenarioTab');
    $scenarioTabs.insertBefore(newTabButton, newScenarioButton);
}

/**
 * Duplica la configuración del escenario activo para crear uno nuevo.
 */
function createNewScenario() {
    // 1. Definir ID y Etiqueta
    const newScenarioId = `custom${scenarioCounter}`;
    const newScenarioLabel = `Escenario Custom ${scenarioCounter}`;
    scenarioCounter++;

    // 2. Duplicar la configuración del escenario ACTIVO
    const activeConfig = initialScenarios.find(s => s.id === activeScenarioId);
    if (!activeConfig) return;

    // Duplicar la metadata (initialScenarios)
    const newScenarioMetadata = {
        ...activeConfig,
        id: newScenarioId,
        label: newScenarioLabel,
        default: false,
        // Profundidad de copia: variables también debe ser un array nuevo
        variables: activeConfig.variables.map(v => ({ ...v })) 
    };
    initialScenarios.push(newScenarioMetadata);

    // Duplicar el estado de los valores (scenarioData)
    scenarioData[newScenarioId] = {
        label: newScenarioLabel,
        variables: { ...scenarioData[activeScenarioId].variables }
    };
    
    console.log(`Nuevo escenario creado: ${newScenarioLabel} (ID: ${newScenarioId})`);

    // 3. Renderizar la nueva pestaña y activarla
    renderNewTab(newScenarioId, newScenarioLabel);
    
    // Devolver el ID del nuevo escenario para su activación
    return newScenarioId;
}

// --- ACTUALIZACIÓN DE handleTabChange ---

/**
 * Maneja el evento de cambio de pestaña.
 * @param {Event} event - Evento de clic.
 */
function handleTabChange(event) {
    const button = event.target.closest('.tab-button');
    if (!button) return;

    if (button.id === 'newScenarioTab') {
        // --- Lógica de Creación y Activación del Nuevo Escenario ---
        const newId = createNewScenario();
        
        // Si se creó exitosamente, cambiamos inmediatamente a la nueva pestaña
        if (newId) {
            // Desactivar pestaña actual antes de activarla por programación
            const activeTab = $scenarioTabs.querySelector('.tab-button.active');
            if (activeTab) {
                activeTab.classList.remove('active');
            }
            
            // Buscar y activar el nuevo botón creado
            const newButton = $scenarioTabs.querySelector(`[data-scenario-id="${newId}"]`);
            if (newButton) {
                newButton.classList.add('active');
                activeScenarioId = newId;
                renderScenarioPanel();
            }
        }
        return;
    }

    // Lógica normal de cambio de pestaña
    const newScenarioId = button.dataset.scenarioId;
    if (newScenarioId === activeScenarioId) return;

    // 1. Desactivar pestaña actual
    $scenarioTabs.querySelector('.tab-button.active').classList.remove('active');

    // 2. Activar nueva pestaña
    button.classList.add('active');

    // 3. Actualizar ID activo y renderizar
    activeScenarioId = newScenarioId;
    renderScenarioPanel();
}
// -----------------------------------------------------------


/**
 * Maneja el evento de clic en 'Generate Projections'.
 */
function handleGenerateProjections() {
    // 1. Simular la validación (ej: Costo < Precio de Venta)
    let isValid = true;
    for (const scenarioId in scenarioData) {
        const vars = scenarioData[scenarioId].variables;
        if (vars.costoItem >= vars.precioVenta) {
            console.error(`Error de validación en ${scenarioId}: Margen Bruto Negativo/Cero.`);
            isValid = false;
            break;
        }
    }

    if (!isValid) {
        // Usa un modal/alerta temporal, recordar que alert() debe ser reemplazado en un entorno real.
        alert("ERROR DE VALIDACIÓN: Margen Bruto Negativo o Cero detectado en uno de los escenarios. El Precio de Venta debe ser mayor que el Costo por Ítem para continuar.");
        return;
    }

    // 2. Simular el envío de datos al endpoint POST /api/simulations/generate
    $generateProjectionsBtn.disabled = true;
    $generateProjectionsBtn.textContent = 'Calculando...';

    setTimeout(() => {
        console.log("Datos de simulación enviados (simulación):", scenarioData);
        $generateProjectionsBtn.disabled = false;
        $generateProjectionsBtn.innerHTML = 'Generate Projections <span class="icon">→</span>';
        
        // NOTA: Aquí se redirigiría a la vista de resultados (e.g., window.location.href = '/projections')
        // ******* CÓDIGO AÑADIDO / MODIFICADO PARA REDIRECCIONAR *******

                window.location.href = '/simulador'; // Redirige a la URL de tu nueva página simulador
        // ******************************

    }, 2000); // Simulación de carga de 2.0 segundos
}


// --- Inicialización de la Aplicación ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar el estado de los datos
    initializeData();

    // 2. Renderizar el panel inicial de nuevo para asegurar los listeners
    renderScenarioPanel();

    // 3. Adjuntar listeners principales
    $scenarioTabs.addEventListener('click', handleTabChange);
    $generateProjectionsBtn.addEventListener('click', handleGenerateProjections);
});