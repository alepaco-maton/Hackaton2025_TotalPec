// escenarios.js - CÓDIGO ACTUALIZADO CON CHART.JS

// ---------------------------------------------------------------------
// --- Elementos del DOM y Variables Globales ---
// ---------------------------------------------------------------------

const productList = document.getElementById('productList');
const productSearch = document.getElementById('productSearch');
const weeklyBtn = document.getElementById('weeklyBtn');
const monthlyBtn = document.getElementById('monthlyBtn'); // Cambiado de 'monthlyToggle' a 'monthlyBtn'
const backBtn = document.getElementById('backBtn');
const nextBtn = document.getElementById('nextBtn');
const applyTrendToggle = document.getElementById('applyTrendToggle');
const chartContainer = document.getElementById('salesChart'); // Canvas element

let salesChartInstance = null; // Variable para almacenar la instancia del gráfico


// ---------------------------------------------------------------------
// --- Datos Ficticios para la Gráfica ---
// ---------------------------------------------------------------------

// Simulación de datos: Ventas (y1) y Forecast (y2)
const FAKE_CHART_DATA = {
    weekly: {
        labels: ['S-1', 'S-2', 'S-3', 'S-4', 'S-5', 'S-6', 'S-7', 'S-8'],
        sales: [500, 550, 480, 600, 650, 700, 620, 750],
        forecast: [480, 520, 500, 580, 630, 680, 650, 720]
    },
    monthly: {
        labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago'],
        sales: [2000, 2200, 1900, 2500, 2800, 3100, 2600, 3300],
        forecast: [1900, 2100, 2000, 2400, 2700, 3000, 2700, 3200]
    }
};

// ---------------------------------------------------------------------
// --- Funciones de Gráfico (Chart.js) ---
// ---------------------------------------------------------------------

/**
 * Renderiza o actualiza el gráfico de líneas con los datos proporcionados.
 * @param {string} period - Granularidad ('weekly' o 'monthly').
 */
const renderChart = (period) => {
    const dataSet = FAKE_CHART_DATA[period];
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
                    borderColor: '#1a73e8', // Azul (color de info en tu CSS)
                    backgroundColor: 'rgba(26, 115, 232, 0.1)',
                    borderWidth: 2,
                    pointRadius: 3,
                    tension: 0.4
                },
                {
                    label: 'Forecast',
                    data: dataSet.forecast,
                    borderColor: '#318a77', // Teal (color primario en tu CSS)
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
            maintainAspectRatio: false, // Importante para que el contenedor CSS defina la altura
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                },
                title: {
                    display: false,
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: unitLabel
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: isWeekly ? 'Semanas' : 'Meses'
                    }
                }
            }
        }
    });

    // Actualizar el título en la UI
    document.querySelector('.chart-container > span:first-child').innerText = isWeekly ? 
        'Weekly Sales Volume (Units)' : 'Monthly Sales Volume (Units)';
};


// ---------------------------------------------------------------------
// --- Funciones de Lógica de Negocio (Actualizadas) ---
// ---------------------------------------------------------------------

/**
 * Simula la actualización de datos históricos y métricas.
 * Ahora incluye el renderizado del gráfico.
 */
const updateHistoricalData = async (itemId, period) => {
    console.log(`[DATA] Solicitando datos para Ítem: ${itemId}, Período: ${period}`);
    
    // 1. Renderizar el nuevo gráfico
    renderChart(period); 

    // 2. Simulación de actualización de la UI
    const historicalTitle = document.querySelector('.p3-col-2 .scenario-title');
    if (historicalTitle) {
        historicalTitle.innerText = `Historical Sales Data (Ítem: ${itemId})`;
    }

    // 3. Actualizar el rango de fecha (simulación)
    const dateRangeSpan = document.querySelector('.chart-container > span:last-child');
    if (dateRangeSpan) {
        dateRangeSpan.innerText = period === 'weekly' ? 'Jan 2023 - Dec 2023 (Weekly)' : 'Jan 2023 - Dec 2023 (Monthly)';
    }
};

/**
 * Maneja la lógica de selección de un ítem en la lista. (Sin cambios mayores)
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
// --- Event Listeners (Actualizados para usar Monthly Button) ---
// ---------------------------------------------------------------------

// 1. Manejo de la Selección de Ítems (Sin cambios)
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

// 3. Selección de Período (Weekly/Monthly)
const handlePeriodSelection = (selectedButton, otherButton, period) => {
   

    // Solo proceder si el botón seleccionado no está ya activo
    if (!selectedButton.classList.contains('active')) {
        // --- 1. CONFIGURAR EL BOTÓN SELECCIONADO (Activo / Primario) ---
        selectedButton.classList.add('active');
        selectedButton.classList.remove('btn-secondary'); // Quita secundario
        selectedButton.classList.add('btn-primary');    // Añade primario

        // --- 2. CONFIGURAR EL OTRO BOTÓN (Inactivo / Secundario) ---
        otherButton.classList.remove('active');
        otherButton.classList.remove('btn-primary');     // Quita primario
        otherButton.classList.add('btn-secondary');     // Añade secundario

        // ... (El resto de tu lógica de negocio) ...

        const selectedItem = productList.querySelector('.list-item.selected');
        if (selectedItem) {
            const itemId = selectedItem.innerText.split(' ')[0];
            // Actualiza la UI (gráfico y métricas)
            updateHistoricalData(itemId, period); 
        }
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


// 5. Botones de Navegación (Footer Actions) (Sin cambios)
if (backBtn) {
    backBtn.addEventListener('click', () => {
        window.location.href = '/upload'; 
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
    
    // Inicializar el gráfico y datos al cargar la página
    if (defaultSelectedItem) {
        const itemId = defaultSelectedItem.innerText.split(' ')[0];
        // Iniciar con la vista semanal ('weekly')
        updateHistoricalData(itemId, 'weekly'); 
    } else {
        // Fallback: si no hay ítem seleccionado, dibujar el gráfico con datos por defecto
        renderChart('weekly');
    }

    // Asegurar que Weekly esté activo por defecto (ya que es la granularidad inicial)
    if (weeklyBtn) weeklyBtn.classList.add('active');
});