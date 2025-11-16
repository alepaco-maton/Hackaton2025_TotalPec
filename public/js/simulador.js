// Referencias a los elementos KPI del DOM
const kpis = {
    sales: document.getElementById('kpi-sales'),
    revenue: document.getElementById('kpi-revenue'),
    cost: document.getElementById('kpi-cost'),
    margin: document.getElementById('kpi-margin'),
};

// Referencia al contexto del canvas y la instancia del gráfico
const chartCtx = document.getElementById('comparisonChart').getContext('2d');
let comparisonChart;

/**
 * Muestra un modal general para mensajes de error o éxito.
 * @param {string} title - Título del modal.
 * @param {string} body - Contenido del mensaje.
 */
function showModal(title, body) {
    document.getElementById('general-modal-title').textContent = title;
    document.getElementById('general-modal-body').textContent = body;
    document.getElementById('general-modal').style.display = 'flex';
}

/**
 * Muestra el modal de confirmación.
 */
function showConfirmationModal() {
    const activeBtn = document.querySelector('.scenario-btn.active');
    const scenarioName = activeBtn ? activeBtn.textContent.split(' ')[0] + ' ' + activeBtn.textContent.split(' ')[1] : 'Seleccionado';
    document.getElementById('confirm-scenario-name').textContent = scenarioName;
    document.getElementById('confirmation-modal').style.display = 'flex';
}

/**
 * Oculta un modal específico.
 * @param {string} id - ID del modal a ocultar.
 */
function hideModal(id) {
    document.getElementById(id).style.display = 'none';
}

/**
 * Muestra el modal de detalle de alerta al hacer clic en una.
 * @param {object} alertData - Objeto de la alerta con tipo, mensaje y severidad.
 */
function openAlertDetails(alertData) {
    const severityMap = { 'high': 'Alta', 'medium': 'Media' };
    
    document.getElementById('alert-detail-title').textContent = `${alertData.type} - Detalles`;
    document.getElementById('detail-alert-type').textContent = alertData.type;
    document.getElementById('detail-alert-severity').textContent = severityMap[alertData.severity.toLowerCase()] || alertData.severity;
    document.getElementById('detail-alert-message').textContent = alertData.message;
    
    // Simulación de datos detallados (para el impacto financiero)
    const riskType = alertData.type.includes('Stockout') ? 'desabastecimiento' : 'exceso de inventario';
    const lossValue = alertData.severity.toLowerCase() === 'high' ? '$85K' : '$30K';
    
    document.getElementById('detail-alert-risk-type').textContent = riskType;
    document.getElementById('detail-alert-loss-value').textContent = lossValue;

    document.getElementById('alert-detail-modal').style.display = 'flex';
}


/**
 * Inicializa la gráfica de Chart.js.
 * @param {object} data - Objeto con labels, datasets y opciones de la gráfica.
 */
function initializeChart(data) {
    // CORRECCIÓN PARA LIGHT MODE: Usar colores oscuros para texto y cuadrículas.
    Chart.defaults.color = '#555'; // Texto de etiquetas oscuro
    Chart.defaults.borderColor = 'rgba(0, 0, 0, 0.1)'; // Cuadrículas claras

    comparisonChart = new Chart(chartCtx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: data.datasets.map(dataset => ({
                ...dataset,
                tension: 0.4, // Suavizar las líneas
                pointRadius: 5,
                pointHoverRadius: 7,
                backgroundColor: dataset.color,
                borderColor: dataset.color,
            })),
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Unidades (Units)',
                        color: '#555' // Título del eje oscuro
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)', // Líneas de cuadrícula claras
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Meses',
                        color: '#555' // Título del eje oscuro
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)', // Líneas de cuadrícula claras
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#333' // Leyenda oscura
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                // Formato de número más legible para miles
                                // Se puede añadir lógica de desviación aquí si se recibe el plan original
                                label += new Intl.NumberFormat('es-CL').format(context.parsed.y) + ' Unidades';
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Actualiza la UI (KPIs, Alertas, Botones) con los datos del nuevo escenario.
 * @param {object} scenarioData - Datos del escenario activo (KPIs, alerts).
 * @param {object} chartData - Datos del gráfico para el nuevo escenario.
 */
function updateUI(scenarioData, chartData) {
    // 1. Actualizar KPIs
    kpis.sales.textContent = scenarioData.simulationData.projectedSales;
    kpis.revenue.textContent = scenarioData.simulationData.totalRevenue;
    kpis.cost.textContent = scenarioData.simulationData.estimatedCost;
    kpis.margin.textContent = scenarioData.simulationData.grossMargin;

    // 2. Actualizar Alertas (Incluyendo el handler onclick)
    const alertPanel = document.getElementById('alert-panel');
    let alertsHTML = '<h3>Alerts</h3>'; 
    
    scenarioData.alerts.forEach(alert => {
        // Usamos JSON.stringify y pasamos el objeto completo al click handler
        const alertJson = JSON.stringify(alert).replace(/"/g, '&quot;'); 

        alertsHTML += `
            <div class="alert ${alert.severity.toLowerCase()}" onclick="openAlertDetails(JSON.parse('${alertJson}'))">
                <span class="icon">!</span>
                <p><strong>${alert.type}:</strong> ${alert.message}</p>
            </div>
        `;
    });
    alertPanel.innerHTML = alertsHTML;

    // 3. Actualizar la Gráfica
    if (comparisonChart) {
        comparisonChart.data.labels = chartData.labels;
        // Mapear los datasets para aplicar estilos consistentes
        comparisonChart.data.datasets = chartData.datasets.map(dataset => ({
            ...dataset,
            tension: 0.4,
            pointRadius: 5,
            pointHoverRadius: 7,
            backgroundColor: dataset.color,
            borderColor: dataset.color,
        }));
        comparisonChart.update();
    } else {
        initializeChart(chartData);
    }

    // 4. Actualizar Botones de Escenario y Footer
    document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
    
    const activeBtn = document.querySelector(`[data-scenario-id="${scenarioData.scenarioId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
    
    // 5. Actualizar acción del botón "Next" y nombre en el modal de confirmación
    document.getElementById('confirm-action-btn').setAttribute('onclick', `finalizeScenario('${scenarioData.scenarioId}')`);
    document.getElementById('confirm-scenario-name').textContent = scenarioData.name;
}

/**
 * Llama al backend para cargar un nuevo escenario.
 * @param {string} scenarioId - ID del escenario a cargar.
 */
async function loadScenario(scenarioId) {
    try {
        document.body.style.cursor = 'wait'; 

        const response = await fetch(`/api/simulador/scenario/${scenarioId}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `(${response.status}) Error al cargar el escenario.`);
        }

        const data = await response.json();
        updateUI(data.activeScenario, data.chartData);

    } catch (error) {
        console.error('Fallo la carga del escenario:', error);
        // Usar modal en lugar de alert()
        showModal('Error al Cargar Escenario', `No se pudieron actualizar los resultados: ${error.message}`);
    } finally {
        document.body.style.cursor = 'default';
    }
}

/**
 * Llama al backend para finalizar la decisión con el escenario activo.
 * Se llama desde el modal de confirmación.
 * @param {string} scenarioId - ID del escenario final seleccionado.
 */
async function finalizeScenario(scenarioId) {
    // 1. Ocultar el modal de confirmación inmediatamente para evitar doble click
    hideModal('confirmation-modal'); 

    try {
        document.body.style.cursor = 'wait'; 

        const response = await fetch('/api/simulador/finalize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ scenarioId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error al finalizar la simulación.');
        }







        // Usar modal para mensaje de éxito y luego redirigir
        showModal('Simulación Finalizada', 'Escenario seleccionado. Avanzando a la generación del Reporte Final.');
        
        // Esperar un breve momento antes de redirigir
        setTimeout(() => {
            // RUTA CORREGIDA según upload.routes.js
            window.location.href = '/reports/final'; 
        }, 1500); 

    } catch (error) {
        console.error('Fallo al finalizar la simulación:', error);
        // Usar modal en lugar de alert()
        showModal('Error de Finalización', `Error al finalizar la simulación: ${error.message}`);
    } finally {
        document.body.style.cursor = 'default';
    }
}