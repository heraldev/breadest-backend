const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

// Importamos la conexión a la BD para que se inicialice
require('./config/db');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const modulosRoutes = require('./routes/modulos.routes');
const configRoutes = require('./routes/config.routes');
const contactoRoutes = require('./routes/contact.routes');

const app = express();

app.set('trust proxy', 1);

// Cabeceras HTTP de seguridad básicas
app.use(helmet());

app.use(cors({
  origin: ['http://216.238.92.39', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', userRoutes);
app.use('/api/configuracion', configRoutes);
app.use('/api', modulosRoutes);
app.use('/api/contacto', contactoRoutes);

// Manejo de 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores 500 (y cualquier error pasado con next(err))
// No se expone el detalle interno/stack al cliente, solo se loguea en el servidor.
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  const mensaje = status === 500 ? 'Error interno del servidor' : err.message;
  res.status(status).json({ error: mensaje });
});

module.exports = app;