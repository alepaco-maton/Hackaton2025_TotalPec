
const bcrypt = require('bcrypt');

// Inicialmente mantenemos las credenciales requeridas por la tarea.
// Por compatibilidad en desarrollo permitimos contraseñas en texto plano
// y usamos bcrypt cuando estén hasheadas.
const validUsers = [
  { username: 'DavidPadilla', password: 'david123', role: 'user' },
  { username: 'admin', password: 'admin', role: 'admin' }
];

async function authenticateUser(username, password) {
  const user = validUsers.find(u => u.username === username);
  if (!user) return null;

  // Si la contraseña almacenada parece un hash bcrypt, comparar con bcrypt
  if (typeof user.password === 'string' && user.password.startsWith('$2')) {
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return null;
    return { username: user.username, role: user.role };
  }

  // Si la contraseña está en texto plano (dev), compararla directamente
  if (password === user.password) {
    // Mejor práctica: re-hash en background y reemplazar en memoria
    bcrypt.hash(user.password, 10).then(hash => {
      user.password = hash;
      console.log(`Hasheada contraseña para usuario ${user.username}`);
    }).catch(() => {});
    return { username: user.username, role: user.role };
  }

  return null;
}

function redirectToDashboard(res, user) {
  if (!user) return res.redirect('/login');
  if (user.role === 'admin') return res.redirect('/admin');
  return res.redirect('/dashboard');
}

async function handleLogin(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).render('login', { error: 'Por favor completa usuario y contraseña' });
  }

  try {
    const user = await authenticateUser(username, password);
    if (!user) {
      return res.status(401).render('login', { error: 'Usuario o contraseña incorrectos' });
    }

    // Guardar sesión
    req.session.user = user;
    if (req.body.remember) {
      req.session.cookie.maxAge = 30 * 24 * 3600 * 1000; // 30 días
    }
    return redirectToDashboard(res, user);
  } catch (err) {
    console.error('Login error', err);
    return res.status(500).render('login', { error: 'Error interno, inténtalo más tarde' });
  }
}

function requireAuth(req, res, next) {
  if (req.session && req.session.user) return next();
  return res.redirect('/login');
}

function handleLogout(req, res) {
  req.session.destroy(err => {
    res.clearCookie('connect.sid');
    return res.redirect('/login');
  });
}

module.exports = {
  authenticateUser,
  handleLogin,
  redirectToDashboard,
  requireAuth,
  handleLogout,
  validUsers
};
