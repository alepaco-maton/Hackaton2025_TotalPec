// createScenario.js
// Lógica de Interacción para la Creación y Definición de Escenarios

// Aseguramos que los datos del servidor estén disponibles
if (typeof window.appData === 'undefined') {
    console.error("Error: appData no está definido. Verifique el script de inicialización en la vista EJS.");
}

// --- Variables Globales y del DOM ---
const initialScenarios = window.appData.scenarios;
const scenarioData = {}; 
let activeScenarioId = initialScenarios.find(s => s.default)?.id || initialScenarios[0].id; 
let scenarioCounter = initialScenarios.length + 1;

const $scenarioTabs = document.getElementById('scenarioTabs');
const $variableGroup = document.getElementById('variableGroup');
const $currentScenarioTitle = document.getElementById('currentScenarioTitle');
const $generateProjectionsBtn = document.getElementById('generateProjectionsBtn');
const $newScenarioTab = document.getElementById('newScenarioTab');


// -----------------------------------------------------------
// --- Lógica de Inicialización y Renderizado ---
// -----------------------------------------------------------

/**
 * Inicializa el estado de los datos al cargar la página.
 */
function initializeData() {
    initialScenarios.forEach(scenario => {
        scenarioData[scenario.id] = {
            label: scenario.label,
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
 */
function generateVariableHTML(variablesTemplate) {
    let html = '';
    const currentVariablesState = scenarioData[activeScenarioId]?.variables || {};

    variablesTemplate.forEach(variable => {
        const currentValue = currentVariablesState[variable.id];
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
        $variableGroup.innerHTML = '<p>No se encontró la configuración para este escenario. Por favor, seleccione otro.</p>';
        $currentScenarioTitle.textContent = 'Seleccione Escenario';
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

// -----------------------------------------------------------
// --- Lógica de Escenarios (Creación y Eliminación) ---
// -----------------------------------------------------------

/**
 * Crea una nueva pestaña de escenario en el DOM.
 * Incluye un botón de eliminar si es un escenario custom.
 */
function renderNewTab(id, label) {
    const newTabButton = document.createElement('button');
    newTabButton.className = 'tab-button';
    newTabButton.dataset.scenarioId = id;
    newTabButton.textContent = label;

    // Solo añadimos el botón de eliminar a los escenarios personalizados
    if (id.startsWith('custom')) {
        const deleteBtn = document.createElement('span');
        deleteBtn.className = 'delete-scenario-btn';
        deleteBtn.innerHTML = '&times;'; 
        deleteBtn.title = `Eliminar ${label}`;
        deleteBtn.dataset.scenarioId = id; // Para identificar el escenario a eliminar
        
        // Agregar espacio antes de la 'x' para separarla de la etiqueta
        newTabButton.innerHTML = `${label}<span style="width: 5px;"></span>`; 
        newTabButton.appendChild(deleteBtn);

        // Agregamos un listener directo para la eliminación
        deleteBtn.addEventListener('click', (e) => {
            // Prevenimos que el clic en la 'x' dispare el cambio de pestaña
            e.stopPropagation(); 
            handleDeleteScenario(id, label);
        });
    }

    $scenarioTabs.insertBefore(newTabButton, $newScenarioTab);
}

/**
 * Duplica la configuración del escenario activo para crear uno nuevo.
 */
function createNewScenario() {
    const newScenarioId = `custom${scenarioCounter}`;
    const newScenarioLabel = `Escenario Custom ${scenarioCounter}`;
    scenarioCounter++;

    const activeConfig = initialScenarios.find(s => s.id === activeScenarioId);
    if (!activeConfig) return;

    // 1. Crear nueva metadata (initialScenarios)
    const newScenarioMetadata = {
        ...activeConfig,
        id: newScenarioId,
        label: newScenarioLabel,
        default: false,
        variables: activeConfig.variables.map(v => ({ ...v })) 
    };
    initialScenarios.push(newScenarioMetadata);

    // 2. Crear nuevo estado de valores (scenarioData)
    scenarioData[newScenarioId] = {
        label: newScenarioLabel,
        variables: { ...scenarioData[activeScenarioId].variables }
    };
    
    // 3. Renderizar y devolver el ID para activar
    renderNewTab(newScenarioId, newScenarioLabel);
    return newScenarioId;
}

/**
 * Maneja el proceso de eliminación de un escenario personalizado.
 */
function handleDeleteScenario(idToDelete, label) {
    // 1. Confirmación de eliminación
    const confirmation = confirm(`¿Estás seguro de que quieres eliminar el escenario "${label}"? Esta acción no se puede deshacer.`);
    
    if (!confirmation) {
        return;
    }

    // 2. Eliminación del estado interno
    delete scenarioData[idToDelete];
    const initialIndex = initialScenarios.findIndex(s => s.id === idToDelete);
    if (initialIndex !== -1) {
        initialScenarios.splice(initialIndex, 1);
    }

    // 3. Eliminación del DOM
    const tabElement = $scenarioTabs.querySelector(`[data-scenario-id="${idToDelete}"]`);
    if (tabElement) {
        tabElement.remove();
    }
    
    // 4. Cambiar al escenario 'realista' si el eliminado estaba activo
    if (idToDelete === activeScenarioId) {
        const realistTab = $scenarioTabs.querySelector(`[data-scenario-id="realista"]`);
        if (realistTab) {
            // Actualizamos la clase 'active' de la pestaña eliminada a la pestaña 'realista'
            $scenarioTabs.querySelector('.tab-button.active')?.classList.remove('active');
            realistTab.classList.add('active');
            activeScenarioId = 'realista'; 
            renderScenarioPanel();
        }
    }
    console.log(`[DELETE] Escenario ${idToDelete} eliminado.`);
}


// -----------------------------------------------------------
// --- Manejadores de Eventos ---
// -----------------------------------------------------------

/**
 * Maneja el cambio de una variable de input (simula el guardado automático).
 */
function handleVariableChange(event) {
    const input = event.target;
    const variableId = input.id;
    const newValue = parseFloat(input.value);

    if (isNaN(newValue)) {
        input.classList.add('input-error');
        return;
    }
    input.classList.remove('input-error');

    if (scenarioData[activeScenarioId]) {
        scenarioData[activeScenarioId].variables[variableId] = newValue;
        // NOTA: Aquí se enviaría la petición PUT/PATCH al servidor de Node.js
    }
}

/**
 * Maneja el evento de cambio de pestaña (solo el clic en la pestaña, no en la 'x').
 */
function handleTabChange(event) {
    const button = event.target.closest('.tab-button');
    if (!button || button.id === 'newScenarioTab' || event.target.closest('.delete-scenario-btn')) return;

    const newScenarioId = button.dataset.scenarioId;
    if (newScenarioId === activeScenarioId) return;

    // Desactivar pestaña actual y activar nueva
    $scenarioTabs.querySelector('.tab-button.active')?.classList.remove('active');
    button.classList.add('active');

    // Actualizar ID activo y renderizar
    activeScenarioId = newScenarioId;
    renderScenarioPanel();
}


/**
 * Maneja el evento de clic en 'Generate Projections'.
 */
function handleGenerateProjections() {
    // 1. Simular la validación (ej: Costo < Precio de Venta)
    let isValid = true;
    // ... (Lógica de validación) ...
    
    if (!isValid) {
        alert("ERROR DE VALIDACIÓN: Margen Bruto Negativo o Cero detectado en uno de los escenarios. El Precio de Venta debe ser mayor que el Costo por Ítem para continuar.");
        return;
    }

    // 2. Simular el envío de datos
    $generateProjectionsBtn.disabled = true;
    $generateProjectionsBtn.textContent = 'Calculando...';

    setTimeout(() => {
        $generateProjectionsBtn.disabled = false;
        $generateProjectionsBtn.innerHTML = 'Generate Projections <span class="icon">→</span>';
        
        // Redirección simulada
        window.location.href = '/simulador'; 
    }, 1500);
}

// -----------------------------------------------------------
// --- Inicialización y Binding de Eventos ---
// -----------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    renderScenarioPanel(); // Renderiza el escenario inicial

    // Listener para el cambio de pestañas (delegación)
    $scenarioTabs.addEventListener('click', handleTabChange);
    
    // Listener para el botón '+ Nuevo Escenario'
    $newScenarioTab.addEventListener('click', () => {
        // Lógica de Creación y Activación
        const newId = createNewScenario();
        if (newId) {
            // Desactivar pestaña anterior
            $scenarioTabs.querySelector('.tab-button.active')?.classList.remove('active');
            
            // Activar nueva pestaña y renderizar
            const newButton = $scenarioTabs.querySelector(`[data-scenario-id="${newId}"]`);
            newButton.classList.add('active');
            activeScenarioId = newId;
            renderScenarioPanel();
        }
    });

    // Listener para el botón 'Generate Projections'
    $generateProjectionsBtn.addEventListener('click', handleGenerateProjections);
    
    // Listener para el botón 'Back'
    const backButton = document.querySelector('.back-button');
    if(backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = '/escenarios'; // Asumiendo que el camino de regreso es /escenarios
        });
    }
});