const pool = require('../config/db');

const listarProductos = async (req, res) => {
  try {
    const query = `
      SELECT p.id, p.nombre, p.categoria_id, c.nombre AS categoria,
             p.precio_venta, p.costo_produccion, p.activo, p.created_at
      FROM productos p
      JOIN categorias c ON c.id = p.categoria_id
      WHERE p.activo = TRUE
      ORDER BY p.id ASC
    `;
    const result = await pool.query(query);
    res.json({ ok: true, productos: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const listarCategorias = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, descripcion FROM categorias ORDER BY id ASC');
    res.json({ ok: true, categorias: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const crearProducto = async (req, res) => {
  try {
    const { nombre, categoria_id, precio_venta, costo_produccion } = req.body;
    if (!nombre || !categoria_id || precio_venta == null || costo_produccion == null) {
      return res.status(400).json({ ok: false, mensaje: 'Todos los campos del producto son obligatorios.' });
    }

    const query = `
      INSERT INTO productos (nombre, categoria_id, precio_venta, costo_produccion)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, categoria_id, precio_venta, costo_produccion]);
    res.status(201).json({ ok: true, producto: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, categoria_id, precio_venta, costo_produccion, activo } = req.body;

    const query = `
      UPDATE productos
      SET nombre = COALESCE($1, nombre),
          categoria_id = COALESCE($2, categoria_id),
          precio_venta = COALESCE($3, precio_venta),
          costo_produccion = COALESCE($4, costo_produccion),
          activo = COALESCE($5, activo)
      WHERE id = $6
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, categoria_id, precio_venta, costo_produccion, activo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
    }
    res.json({ ok: true, producto: result.rows[0] });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const eliminarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('UPDATE productos SET activo = FALSE WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, mensaje: 'Producto no encontrado.' });
    }
    res.json({ ok: true, mensaje: 'Producto desactivado correctamente.' });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = {
  listarProductos,
  listarCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};
