const express = require('express');
const router = express.Router();
const {
  handleLogin,
  handleLogout,
  requireAuth
} = require('../controllers/login.controller');

// Mostrar formulario de login
router.get('/login', (req, res) => {
  // Si ya está autenticado, redirigir
  if (req.session && req.session.user) {
    return res.redirect('/dashboard');
  }
  return res.render('login');
});

// Procesar login
router.post('/login', handleLogin);

// Logout
router.get('/logout', handleLogout);

// Ruta de ejemplo protegida: dashboard
router.get('/dashboard', requireAuth, (req, res) => {
  res.render('dashboard', { user: req.session.user });
});

// Ruta de admin protegida
router.get('/admin', requireAuth, (req, res) => {
  const user = req.session.user || {};
  if (user.role !== 'admin') return res.status(403).send('Forbidden');
  return res.render('admin', { user });
});

module.exports = router;
