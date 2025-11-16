/* upload.js - CÓDIGO COMPLETO Y ACTUALIZADO */

// --- Elementos del DOM ---
const uploadForm = document.getElementById("uploadForm");
const fileInput = document.getElementById("csvFile");
const progressBar = document.getElementById("progress-bar");
const statusElement = document.getElementById("upload-status");
const continueBtn = document.getElementById("continueBtn");
const dropText = document.getElementById("drop-text");
const fileDisplay = document.getElementById("file-display");

/**
 * Función que resetea el área de selección y el estado visual
 */
const resetFileArea = () => {
    dropText.style.display = 'block';
    fileDisplay.style.display = 'none';
    fileDisplay.innerText = '';
    // Limpiar el input para permitir la subida del mismo archivo
    fileInput.value = ''; 
}

/**
 * Función que actualiza el área de selección con el nombre del archivo.
 * @param {string} fileName - El nombre del archivo.
 */
const updateFileDisplay = (fileName) => {
    // Ocultar el texto de arrastrar/seleccionar
    dropText.style.display = 'none';
    
    // Mostrar el nombre del archivo
    fileDisplay.innerText = fileName;
    fileDisplay.style.display = 'block';
}


/**
 * Función que maneja la subida del archivo al servidor, la simulación del
 * progreso y la actualización del estado de la interfaz de usuario.
 * @param {File} file - El objeto File seleccionado por el usuario.
 */
const startUploadProcess = async (file) => {
    // Generar un tiempo de procesamiento total aleatorio entre 2000ms y 4000ms
    const totalProcessingTime = Math.floor(Math.random() * (4000 - 2000 + 1)) + 2000;
    
    // El 60% del tiempo se dedicará a la simulación del procesamiento
    const processTime = totalProcessingTime * 0.6; 
    
    const simulatedRows = Math.floor(Math.random() * 5000) + 100;

    // 1. DESHABILITAR BOTONES E INICIAR RESET
    continueBtn.disabled = true;
    progressBar.style.width = "0%";
    progressBar.style.backgroundColor = '#1a73e8'; // Color de carga (Azul)
    statusElement.innerText = "";
    
    const formData = new FormData();
    formData.append("csvFile", file);

    try {
        // --- Fase 1: Iniciando Subida (Feedback inmediato) ---
        statusElement.innerText = `1. Iniciando subida de: ${file.name}...`;
        progressBar.style.width = "10%"; // Progreso inicial

        // --- Fase 2: Subiendo (Comunicación con el servidor) ---
        statusElement.innerText = "2. Subiendo al servidor...";
        progressBar.style.width = "40%"; 

        // Se inicia la petición real al servidor
        const res = await fetch("/upload-csv", { method: "POST", body: formData });
        
        // Si el fetch falla (red o http error)
        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || `Error del servidor: ${res.status}`);
        }
        
        // --- Fase 3: Procesando en el servidor (Simulación de tiempo de CPU) ---
        statusElement.innerText = `3. Archivo recibido. Procesando datos (Simulando ${Math.round(processTime)}ms)...`;
        progressBar.style.width = "75%"; // Progreso de procesamiento
        
        // Simular la espera del procesamiento (el delay es manejado en el frontend)
        await new Promise(r => setTimeout(r, processTime));
        
        // El servidor responde con el resultado del procesamiento
        const data = await res.json();

        // --- Éxito y Feedback Final ---
        progressBar.style.width = "100%";
        progressBar.style.backgroundColor = '#28a745'; // Color de éxito (Verde)
        
        // Mensaje de confirmación detallado
        statusElement.innerHTML = `✅ **¡Carga Exitosa!** Archivo: **${file.name}** procesado con **${data.rows || simulatedRows}** filas.`;

        // Habilitar botón de continuar
        continueBtn.disabled = false;

    } catch (err) {
        // Manejo de Error
        console.error(err);
        progressBar.style.width = "100%";
        progressBar.style.backgroundColor = '#dc3545'; // Color de error (Rojo)
        statusElement.innerHTML = `❌ **Error al subir o procesar el archivo:** ${err.message || 'Error desconocido'}`;
        
    } finally {
        // Lógica de UX: Solo re-habilitar la interacción si el proceso falló.
        if (continueBtn.disabled === true) {
            // Si falló, resetear el área para que el usuario pueda intentar de nuevo
            resetFileArea(); 
        }
    }
};

// ---------------------------------------------------------------------
// --- CONFIGURACIÓN DE EVENTOS (Listeners) ---
// ---------------------------------------------------------------------

// El listener de 'change' es el disparador principal para la selección de archivo.
fileInput.addEventListener("change", () => {
    if (fileInput.files.length) {
        const file = fileInput.files[0];
        const fileName = file.name;
        
        // Actualizar el display 
        updateFileDisplay(fileName);

        // Iniciar el proceso de subida
        startUploadProcess(file);

    } else {
        // Si el diálogo se cierra sin seleccionar nada
        resetFileArea();
    }
});

// 3. Redirección al Continuar
continueBtn.addEventListener("click", () => {
    window.location.href = '/previsualizacion';
});


// ---------------------------------------------------------------------
// --- LOGICA DRAG AND DROP (D&D) ---
// ---------------------------------------------------------------------

// Previene el comportamiento por defecto del navegador para D&D (Abrir archivo)
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    uploadForm.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

// 1. Resaltar/Quitar Resaltado de la zona de arrastre (Feedback visual)
['dragenter', 'dragover'].forEach(eventName => {
    uploadForm.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    uploadForm.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    uploadForm.classList.add('highlight');
}

function unhighlight() {
    uploadForm.classList.remove('highlight');
}

// 2. Manejar el archivo soltado
uploadForm.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length) {
        const file = files[0];
        
        // Validación básica de tipo CSV al arrastrar y soltar
        if (file.type !== 'text/csv' && file.name.split('.').pop().toLowerCase() !== 'csv') {
            statusElement.innerHTML = `❌ **Error de formato:** Solo se permiten archivos **CSV**.`;
            progressBar.style.width = "100%";
            progressBar.style.backgroundColor = '#dc3545';
            return; 
        }

        // Asignar el archivo al input:
        fileInput.files = files; 

        // Disparar el evento 'change' del input file para iniciar la lógica de subida
        fileInput.dispatchEvent(new Event('change'));
    }
}