const express = require('express');
const cors = require('cors');
const pool = require('./config/db');

const app = express();

app.use(cors());
app.use(express.json());

// Verificación inicial de salud y conexión a PostgreSQL
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

module.exports = app;