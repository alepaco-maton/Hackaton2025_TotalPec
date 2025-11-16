const csvService = require('../services/csv.service');

module.exports = {
  renderPage: (req, res) => {
    res.render('upload');
  },

  processCSV: async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se recibió archivo' });

    try {
      const rows = await csvService.process(req.file.path);
      res.json({ status: 'ok', rows: rows.length });
    } catch (err) {
      res.status(500).json({ error: 'Error procesando CSV' });
    }
  }
};
