const pool = require('../config/db');

const listarInsumos = async (req, res) => {
  try {
    const query = `
      SELECT id, nombre, unidad_medida, stock_actual, stock_minimo, costo_unitario,
             (stock_actual <= stock_minimo) AS alerta_stock_bajo
      FROM insumos
      ORDER BY id ASC
    `;
    const result = await pool.query(query);
    res.json({ ok: true, insumos: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const crearInsumo = async (req, res) => {
  try {
    const { nombre, unidad_medida, stock_actual, stock_minimo, costo_unitario } = req.body;
    if (!nombre || !unidad_medida || costo_unitario == null) {
      return res.status(400).json({ ok: false, mensaje: 'Nombre, unidad de medida y costo unitario son obligatorios.' });
    }

    const query = `
      INSERT INTO insumos (nombre, unidad_medida, stock_actual, stock_minimo, costo_unitario)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const result = await pool.query(query, [
      nombre,
      unidad_medida,
      stock_actual || 0,
      stock_minimo || 0,
      costo_unitario,
    ]);
    res.status(201).json({ ok: true, insumo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const actualizarInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, unidad_medida, stock_actual, stock_minimo, costo_unitario } = req.body;

    const query = `
      UPDATE insumos
      SET nombre = COALESCE($1, nombre),
          unidad_medida = COALESCE($2, unidad_medida),
          stock_actual = COALESCE($3, stock_actual),
          stock_minimo = COALESCE($4, stock_minimo),
          costo_unitario = COALESCE($5, costo_unitario)
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, unidad_medida, stock_actual, stock_minimo, costo_unitario, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
    }
    res.json({ ok: true, insumo: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const eliminarInsumo = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM insumos WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Insumo no encontrado.' });
    }
    res.json({ ok: true, mensaje: 'Insumo eliminado correctamente.' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { listarInsumos, crearInsumo, actualizarInsumo, eliminarInsumo };
