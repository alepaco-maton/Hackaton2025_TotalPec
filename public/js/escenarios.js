// escenarios.js - CÓDIGO ACTUALIZADO CON DATOS FICTICIOS DINÁMICOS Y LÓGICA DE BOTONES

// ---------------------------------------------------------------------
// --- Elementos del DOM y Variables Globales ---
// ---------------------------------------------------------------------

const productList = document.getElementById('productList');
const productSearch = document.getElementById('productSearch');
const weeklyBtn = document.getElementById('weeklyBtn');
const monthlyBtn = document.getElementById('monthlyBtn'); 
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const applyTrendToggle = document.getElementById('applyTrendToggle');
const chartContainer = document.getElementById('salesChart'); // Canvas element

// Elementos para Key Metrics (DEBES AGREGAR ESTOS IDs A TU HTML)
const totalUnitsElement = document.getElementById('metricTotalUnits');
const avgWeeklySalesElement = document.getElementById('metricAvgWeeklySales');
const bestPeriodElement = document.getElementById('metricBestPeriod');

let salesChartInstance = null; // Variable para almacenar la instancia del gráfico


// ---------------------------------------------------------------------
// --- Datos Ficticios para Gráficas y Métricas (Simulación Avanzada) ---
// ---------------------------------------------------------------------

const ALL_ITEM_DATA = {
    // Item 1: OUR10003726 (Filtro de Aceite) - Tendencia Creciente Suave
    'OUR10003726': {
        metrics: { totalUnits: 5200, avgWeekly: 100, bestPeriod: 'July - Aug' },
        weekly: {
            labels: Array.from({ length: 12 }, (_, i) => `S-${i + 1}`),
            sales: [95, 100, 105, 102, 110, 115, 112, 120, 125, 122, 130, 135],
            forecast: [100, 105, 108, 110, 115, 118, 120, 125, 128, 130, 135, 140]
        },
        monthly: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            sales: [400, 420, 450, 480, 500, 550],
            forecast: [410, 440, 470, 500, 530, 580]
        }
    },
    // Item 2: OUR10002030 (Batería Premium) - Estacionalidad Marcada
    'OUR10002030': {
        metrics: { totalUnits: 7500, avgWeekly: 144, bestPeriod: 'Dec - Jan (Pico)' },
        weekly: {
            labels: Array.from({ length: 12 }, (_, i) => `S-${i + 1}`),
            sales: [150, 160, 140, 180, 250, 280, 190, 150, 130, 140, 160, 170], 
            forecast: [155, 165, 150, 190, 260, 290, 200, 160, 140, 150, 170, 180]
        },
        monthly: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            sales: [600, 650, 1200, 1500, 800, 750],
            forecast: [620, 700, 1250, 1550, 850, 800]
        }
    },
    // Item 3: BIO130350 (Lubricante Industrial) - Irregular con Evento Único
    'BIO130350': {
        metrics: { totalUnits: 3100, avgWeekly: 60, bestPeriod: 'Week 8 (Promoción)' },
        weekly: {
            labels: Array.from({ length: 12 }, (_, i) => `S-${i + 1}`),
            sales: [50, 55, 60, 50, 65, 55, 70, 180, 60, 45, 50, 55], 
            forecast: [55, 60, 60, 55, 70, 60, 75, 190, 65, 50, 55, 60]
        },
        monthly: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
            sales: [250, 280, 300, 270, 290, 350],
            forecast: [260, 290, 310, 280, 300, 360]
        }
    },
    // Ítem por defecto si no se encuentra (IMPORTANTE: MANTENER AL MENOS 1 ÍTEM DE EJEMPLO EN EL HTML)
    'default': {
        metrics: { totalUnits: 0, avgWeekly: 0, bestPeriod: 'N/A' },
        weekly: { labels: ['S-1'], sales: [0], forecast: [0] },
        monthly: { labels: ['Ene'], sales: [0], forecast: [0] }
    }
};


// ---------------------------------------------------------------------
// --- Funciones de Gráfico (Chart.js) ---
// ---------------------------------------------------------------------

/**
 * Renderiza o actualiza el gráfico de líneas con los datos proporcionados.
 * @param {string} period - Granularidad ('weekly' o 'monthly').
 * @param {object} dataSet - El objeto de datos (sales, forecast, labels) para el ítem.
 */
const renderChart = (period, dataSet) => {
    const isWeekly = period === 'weekly';
    const unitLabel = isWeekly ? 'Unidades Semanales' : 'Unidades Mensuales';

    // Destruir la instancia anterior si existe para evitar conflictos
    if (salesChartInstance) {
        salesChartInstance.destroy();
    }

    salesChartInstance = new Chart(chartContainer, {
        type: 'line',
        data: {
            labels: dataSet.labels,
            datasets: [
                {
                    label: 'Ventas Reales',
                    data: dataSet.sales,
                    borderColor: '#1a73e8', // Azul (Ventas Históricas)
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.4
                },
                {
                    label: 'Forecast Base',
                    data: dataSet.forecast,
                    borderColor: '#318a77', // Teal (Pronóstico)
                    backgroundColor: 'rgba(49, 138, 119, 0.1)',
                    borderDash: [5, 5],
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: { display: true, position: 'top' },
                title: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: { display: true, text: unitLabel }
                },
                x: {
                    title: { display: true, text: isWeekly ? 'Semanas' : 'Meses' }
                }
            }
        }
    });

    // Actualizar el título en la UI
    document.querySelector('.chart-container > span:first-child').innerText = isWeekly ? 
        'Weekly Sales Volume (Units)' : 'Monthly Sales Volume (Units)';
};


// ---------------------------------------------------------------------
// --- Funciones de Lógica de Negocio ---
// ---------------------------------------------------------------------

/**
 * Actualiza los datos históricos, métricas y el gráfico según el ítem y período.
 */
const updateHistoricalData = (itemId, period) => {
    const itemData = ALL_ITEM_DATA[itemId] || ALL_ITEM_DATA['default'];
    
    // 1. Obtener el set de datos correcto
    const dataSet = itemData[period] || ALL_ITEM_DATA['default'][period];

    // 2. Renderizar el nuevo gráfico
    renderChart(period, dataSet);

    // 3. Actualizar Key Metrics
    if (totalUnitsElement) totalUnitsElement.innerText = itemData.metrics.totalUnits.toLocaleString();
    if (avgWeeklySalesElement) avgWeeklySalesElement.innerText = itemData.metrics.avgWeekly.toLocaleString();
    if (bestPeriodElement) bestPeriodElement.innerText = itemData.metrics.bestPeriod;

    // 4. Actualizar títulos
    const historicalTitle = document.querySelector('.p3-col-2 .scenario-title');
    if (historicalTitle) {
        historicalTitle.innerText = `Historical Sales Data (ID: ${itemId})`;
    }
    const dateRangeSpan = document.querySelector('.chart-container > span:last-child');
    if (dateRangeSpan) {
        dateRangeSpan.innerText = period === 'weekly' ? 'Last 12 Weeks' : 'Last 6 Months';
    }
};

/**
 * Maneja la lógica de selección de un ítem en la lista.
 */
const handleItemSelection = (selectedElement) => {
    productList.querySelectorAll('.list-item').forEach(item => {
        item.classList.remove('selected');
    });

    selectedElement.classList.add('selected');
    const itemId = selectedElement.innerText.split(' ')[0]; 
    
    const currentPeriod = weeklyBtn.classList.contains('active') ? 'weekly' : 'monthly';
    
    updateHistoricalData(itemId, currentPeriod);
};


// ---------------------------------------------------------------------
// --- Event Listeners ---
// ---------------------------------------------------------------------

// 1. Manejo de la Selección de Ítems
if (productList) {
    productList.addEventListener('click', (event) => {
        const item = event.target.closest('.list-item');
        if (item) {
            handleItemSelection(item);
        }
    });
}

// 2. Búsqueda y Filtrado de Ítems (Sin cambios)
if (productSearch && productList) {
    productSearch.addEventListener('input', () => {
        const searchText = productSearch.value.toLowerCase();
        let filteredCount = 0;

        productList.querySelectorAll('.list-item').forEach(item => {
            const itemName = item.innerText.toLowerCase();
            if (itemName.includes(searchText)) {
                item.style.display = 'block';
                filteredCount++;
            } else {
                item.style.display = 'none';
            }
        });
        console.log(`[Search] Ítems filtrados: ${filteredCount}`);
    });
}

// 3. Selección de Período (Weekly/Monthly) - Lógica de estilo y activo
const handlePeriodSelection = (selectedButton, otherButton, period) => {
    if (!selectedButton.classList.contains('active')) {
        // CONFIGURAR EL BOTÓN SELECCIONADO (Activo / Primario)
        selectedButton.classList.add('active', 'btn-primary');
        selectedButton.classList.remove('btn-secondary');    

        // CONFIGURAR EL OTRO BOTÓN (Inactivo / Secundario)
        otherButton.classList.remove('active', 'btn-primary');
        otherButton.classList.add('btn-secondary');     

        // Ejecutar lógica de negocio
        const selectedItem = productList.querySelector('.list-item.selected');
        const itemId = selectedItem ? selectedItem.innerText.split(' ')[0] : 'default';
        
        updateHistoricalData(itemId, period);
    }
};

if (weeklyBtn && monthlyBtn) {
    weeklyBtn.addEventListener('click', () => handlePeriodSelection(weeklyBtn, monthlyBtn, 'weekly'));
    monthlyBtn.addEventListener('click', () => handlePeriodSelection(monthlyBtn, weeklyBtn, 'monthly'));
}


// 4. Toggle de Tendencia y Estacionalidad (Sin cambios)
if (applyTrendToggle) {
    applyTrendToggle.addEventListener('click', () => {
        applyTrendToggle.classList.toggle('active');
        const state = applyTrendToggle.classList.contains('active') ? 'Activado' : 'Desactivado';
        console.log(`[Config] Apply Trend & Seasonality: ${state}`);
    });
}


// 5. Botones de Navegación (Footer Actions) - Redirección a /cargar-datos
if (backBtn) {
    backBtn.addEventListener('click', () => {
        // Redirige a la página de carga de datos
        window.location.href = '/cargar-datos'; 
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        window.location.href = '/configurescenarios'; 
    });
}


// ---------------------------------------------------------------------
// --- Inicialización (Al cargar la página) ---
// ---------------------------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    const defaultSelectedItem = productList ? productList.querySelector('.list-item.selected') : null;
    let initialItemId = 'default';
    
    // Asegurar que Weekly esté activo por defecto (si el HTML no lo garantiza)
    if (weeklyBtn) {
        weeklyBtn.classList.add('active', 'btn-primary');
        weeklyBtn.classList.remove('btn-secondary');
    }
    if (monthlyBtn) {
        monthlyBtn.classList.remove('active', 'btn-primary');
        monthlyBtn.classList.add('btn-secondary');
    }

    // Seleccionar el primer ítem si no hay uno marcado como 'selected'
    if (!defaultSelectedItem && productList && productList.children.length > 0) {
        productList.children[0].classList.add('selected');
        initialItemId = productList.children[0].innerText.split(' ')[0];
    } else if (defaultSelectedItem) {
        initialItemId = defaultSelectedItem.innerText.split(' ')[0];
    }

    // Inicializar el gráfico y datos
    updateHistoricalData(initialItemId, 'weekly'); 
});