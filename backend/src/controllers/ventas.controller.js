const pool = require('../config/db');

const listarVentas = async (req, res) => {
  try {
    const query = `
      SELECT v.id, v.fecha, v.total, v.created_at, u.nombre AS vendedor
      FROM ventas v
      JOIN usuarios u ON u.id = v.usuario_id
      ORDER BY v.fecha DESC, v.id DESC
    `;
    const result = await pool.query(query);
    res.json({ ok: true, ventas: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const obtenerVentaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ventaRes = await pool.query(
      `SELECT v.id, v.fecha, v.total, v.created_at, u.nombre AS vendedor
       FROM ventas v
       JOIN usuarios u ON u.id = v.usuario_id
       WHERE v.id = $1`,
      [id]
    );

    if (ventaRes.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Venta no encontrada.' });
    }

    const detallesRes = await pool.query(
      `SELECT dv.id, dv.producto_id, p.nombre AS producto, dv.cantidad, dv.precio_unitario, dv.subtotal
       FROM detalle_ventas dv
       JOIN productos p ON p.id = dv.producto_id
       WHERE dv.venta_id = $1`,
      [id]
    );

    res.json({
      ok: true,
      venta: {
        ...ventaRes.rows[0],
        detalles: detallesRes.rows,
      },
    });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const registrarVenta = async (req, res) => {
  const client = await pool.connect();
  try {
    const { fecha, items } = req.body;
    const usuarioId = req.usuario.id;

    if (!fecha || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, mensaje: 'Debes indicar la fecha y al menos un producto vendido.' });
    }

    await client.query('BEGIN');

    const ventaInsert = await client.query(
      'INSERT INTO ventas (fecha, usuario_id, total) VALUES ($1, $2, 0) RETURNING id, fecha',
      [fecha, usuarioId]
    );
    const ventaId = ventaInsert.rows[0].id;
    let totalVenta = 0;

    for (const item of items) {
      const prodRes = await client.query('SELECT precio_venta FROM productos WHERE id = $1', [item.producto_id]);
      if (prodRes.rows.length === 0) {
        throw new Error(`El producto con ID ${item.producto_id} no existe.`);
      }

      const precioUnitario = Number(prodRes.rows[0].precio_venta);
      const cantidad = Number(item.cantidad);
      const subtotal = Number((precioUnitario * cantidad).toFixed(2));
      totalVenta += subtotal;

      await client.query(
        `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [ventaId, item.producto_id, cantidad, precioUnitario, subtotal]
      );
    }

    await client.query('UPDATE ventas SET total = $1 WHERE id = $2', [totalVenta.toFixed(2), ventaId]);
    await client.query('COMMIT');

    res.status(201).json({
      ok: true,
      mensaje: 'Venta registrada correctamente.',
      venta: { id: ventaId, fecha, total: Number(totalVenta.toFixed(2)) },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ ok: false, mensaje: error.message });
  } finally {
    client.release();
  }
};

const obtenerDemandaDiaria = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_demanda_diaria ORDER BY fecha DESC, producto_id ASC LIMIT 200');
    res.json({ ok: true, demanda: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { listarVentas, obtenerVentaPorId, registrarVenta, obtenerDemandaDiaria };
