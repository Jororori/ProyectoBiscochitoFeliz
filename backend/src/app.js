const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const productosRoutes = require('./routes/productos.routes');
const insumosRoutes = require('./routes/insumos.routes');
const ventasRoutes = require('./routes/ventas.routes');
const temporadasRoutes = require('./routes/temporadas.routes');
const prediccionRoutes = require('./routes/prediccion.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() AS hora_bd, (SELECT COUNT(*) FROM productos) AS productos_registrados');
    res.json({
      ok: true,
      sistema: 'Panadería Biscochito Feliz API',
      bd: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/productos', productosRoutes);
app.use('/api/insumos', insumosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/temporadas', temporadasRoutes);
app.use('/api/prediccion', prediccionRoutes);

module.exports = app;
