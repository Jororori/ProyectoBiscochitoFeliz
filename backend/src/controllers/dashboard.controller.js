const pool = require('../config/db');

const obtenerResumen = async (req, res) => {
  try {
    const [ventasRes, prodRes, insumosRes, modeloRes] = await Promise.all([
      pool.query('SELECT COUNT(*)::INTEGER AS total_ventas, COALESCE(SUM(total), 0)::NUMERIC(12,2) AS ingresos_totales FROM ventas'),
      pool.query('SELECT COUNT(*)::INTEGER AS productos_activos FROM productos WHERE activo = TRUE'),
      pool.query('SELECT COUNT(*)::INTEGER AS insumos_criticos FROM insumos WHERE stock_actual <= stock_minimo'),
      pool.query('SELECT algoritmo, metrica_r2, fecha_entrenamiento FROM modelos_ml WHERE activo = TRUE ORDER BY id DESC LIMIT 1'),
    ]);

    res.json({
      ok: true,
      kpis: {
        total_ventas: ventasRes.rows[0].total_ventas,
        ingresos_totales: Number(ventasRes.rows[0].ingresos_totales),
        productos_activos: prodRes.rows[0].productos_activos,
        insumos_criticos: insumosRes.rows[0].insumos_criticos,
        modelo_activo: modeloRes.rows[0] || null,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const topProductos = async (req, res) => {
  try {
    const query = `
      SELECT p.nombre AS producto, c.nombre AS categoria,
             SUM(dv.cantidad)::INTEGER AS unidades_vendidas,
             SUM(dv.subtotal)::NUMERIC(12,2) AS ingresos
      FROM detalle_ventas dv
      JOIN productos p ON p.id = dv.producto_id
      JOIN categorias c ON c.id = p.categoria_id
      GROUP BY p.id, p.nombre, c.nombre
      ORDER BY unidades_vendidas DESC
      LIMIT 7
    `;
    const result = await pool.query(query);
    res.json({ ok: true, top_productos: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const ventasMensuales = async (req, res) => {
  try {
    const query = `
      SELECT TO_CHAR(fecha, 'YYYY-MM-DD') AS fecha,
             SUM(cantidad_vendida)::INTEGER AS total_unidades
      FROM v_demanda_diaria
      GROUP BY fecha
      ORDER BY fecha ASC
      LIMIT 30
    `;
    const result = await pool.query(query);
    res.json({ ok: true, serie_diaria: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { obtenerResumen, topProductos, ventasMensuales };
