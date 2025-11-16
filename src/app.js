const express = require('express');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/auth.routes');
const uploadRoutes = require('./routes/upload.routes');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, '../public')));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware
const SESSION_SECRET = process.env.SESSION_SECRET || 'supersecret_change_me';
app.use(session({
	secret: SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	cookie: { secure: false }
}));

// Routes
app.use('/', authRoutes);
app.use('/', uploadRoutes);

// Example: middleware to protect other routes could be applied in route files.

module.exports = app;
