// controllers/reports.controller.js
const simulationService = require('../services/simulation.service');
const excelService = require('../services/excel.service'); // Necesitarás este servicio para la exportación

module.exports = {
    /**
     * Renderiza la página 5 (Decisión Ejecutiva) con los datos finales.
     */
    renderFinalReport: async (req, res) => {
        try {
            const data = await simulationService.getFinalReportData();
            res.render('final-report', { data });
        } catch (err) {
            console.error('Error al obtener datos del reporte final:', err);
            res.status(500).send('Error cargando la página de reportes.');
        }
    },

    /**
     * Maneja la solicitud de descarga de la sugerencia de compras.
     */
    exportPurchaseSuggestion: async (req, res) => {
        try {
            const report = await simulationService.getFinalReportData();
            const filename = `Sugerencia_Compras_${Date.now()}.xlsx`;

            // Generar el buffer del archivo Excel/CSV
            const buffer = await excelService.generatePurchaseExcel(report.purchaseReport);

            // Configurar headers para forzar la descarga
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
            
            res.send(buffer);
        } catch (err) {
            console.error('Error al exportar la sugerencia de compras:', err);
            res.status(500).json({ error: 'Error al generar el archivo de exportación.' });
        }
    }
};