const pool = require('../config/db');

const listarTemporadas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM temporadas ORDER BY fecha_inicio ASC');
    res.json({ ok: true, temporadas: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const crearTemporada = async (req, res) => {
  try {
    const { nombre, fecha_inicio, fecha_fin } = req.body;
    if (!nombre || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({ ok: false, mensaje: 'Nombre, fecha_inicio y fecha_fin son obligatorios.' });
    }
    const result = await pool.query(
      'INSERT INTO temporadas (nombre, fecha_inicio, fecha_fin) VALUES ($1, $2, $3) RETURNING *',
      [nombre, fecha_inicio, fecha_fin]
    );
    res.status(201).json({ ok: true, temporada: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const eliminarTemporada = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM temporadas WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Temporada no encontrada.' });
    }
    res.json({ ok: true, mensaje: 'Temporada eliminada correctamente.' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { listarTemporadas, crearTemporada, eliminarTemporada };
