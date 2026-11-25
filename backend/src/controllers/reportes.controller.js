const pool = require('../config/db');

const reporteVentas = async (req, res) => {
  try {
    const query = `
      SELECT v.id AS venta_id, TO_CHAR(v.fecha, 'YYYY-MM-DD') AS fecha,
             u.nombre AS vendedor, p.nombre AS producto,
             dv.cantidad, dv.precio_unitario, dv.subtotal
      FROM ventas v
      JOIN usuarios u ON u.id = v.usuario_id
      JOIN detalle_ventas dv ON dv.venta_id = v.id
      JOIN productos p ON p.id = dv.producto_id
      ORDER BY v.fecha DESC, v.id DESC
      LIMIT 500
    `;
    const result = await pool.query(query);
    res.json({ ok: true, datos: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const reportePredicciones = async (req, res) => {
  try {
    const query = `
      SELECT pr.id, TO_CHAR(pr.fecha_prediccion, 'YYYY-MM-DD') AS fecha_prediccion,
             p.nombre AS producto, c.nombre AS categoria,
             pr.cantidad_estimada, m.algoritmo, m.metrica_r2
      FROM predicciones pr
      JOIN productos p ON p.id = pr.producto_id
      JOIN categorias c ON c.id = p.categoria_id
      JOIN modelos_ml m ON m.id = pr.modelo_id
      ORDER BY pr.fecha_prediccion DESC, pr.id DESC
      LIMIT 500
    `;
    const result = await pool.query(query);
    res.json({ ok: true, datos: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { reporteVentas, reportePredicciones };
