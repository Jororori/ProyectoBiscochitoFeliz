const pool = require('../config/db');

const obtenerRecomendacion = async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ ok: false, mensaje: 'Debes indicar el parámetro ?fecha=YYYY-MM-DD' });
    }

    const cfgRes = await pool.query("SELECT valor FROM configuracion WHERE clave = 'margen_seguridad_porcentaje'");
    const margen = Number(cfgRes.rows[0]?.valor || 5) / 100;

    const query = `
      SELECT DISTINCT ON (pr.producto_id)
             pr.id AS prediccion_id, pr.fecha_prediccion, pr.producto_id,
             p.nombre AS producto, c.nombre AS categoria,
             pr.cantidad_estimada,
             CEIL(pr.cantidad_estimada * (1 + $2))::INTEGER AS cantidad_recomendada
      FROM predicciones pr
      JOIN productos p ON p.id = pr.producto_id
      JOIN categorias c ON c.id = p.categoria_id
      WHERE pr.fecha_prediccion = $1
      ORDER BY pr.producto_id, pr.created_at DESC
    `;
    const result = await pool.query(query, [fecha, margen]);

    res.json({
      ok: true,
      fecha,
      margen_seguridad_aplicado: `${margen * 100}%`,
      recomendaciones: result.rows,
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const registrarProduccion = async (req, res) => {
  try {
    const { fecha, producto_id, cantidad_recomendada, cantidad_producida, prediccion_id } = req.body;
    if (!fecha || !producto_id || cantidad_producida == null) {
      return res.status(400).json({ ok: false, mensaje: 'Fecha, producto_id y cantidad_producida son obligatorios.' });
    }

    // Buscar si ya hubo ventas ese día para calcular sobrante real
    const ventasRes = await pool.query(
      `SELECT COALESCE(SUM(dv.cantidad), 0)::INTEGER AS vendido
       FROM detalle_ventas dv
       JOIN ventas v ON v.id = dv.venta_id
       WHERE v.fecha = $1 AND dv.producto_id = $2`,
      [fecha, producto_id]
    );
    const vendido = ventasRes.rows[0].vendido;
    const sobrante = Math.max(0, Number(cantidad_producida) - vendido);

    const query = `
      INSERT INTO produccion (fecha, producto_id, cantidad_recomendada, cantidad_producida, cantidad_sobrante, prediccion_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      fecha,
      producto_id,
      cantidad_recomendada || cantidad_producida,
      cantidad_producida,
      sobrante,
      prediccion_id || null,
    ]);

    res.status(201).json({ ok: true, produccion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const listarProduccion = async (req, res) => {
  try {
    const query = `
      SELECT pr.id, pr.fecha, p.nombre AS producto, pr.cantidad_recomendada,
             pr.cantidad_producida, pr.cantidad_sobrante
      FROM produccion pr
      JOIN productos p ON p.id = pr.producto_id
      ORDER BY pr.fecha DESC, pr.id DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json({ ok: true, registros: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { obtenerRecomendacion, registrarProduccion, listarProduccion };
