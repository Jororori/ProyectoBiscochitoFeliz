const pool = require('../config/db');
const { entrenarModelo } = require('../ml/entrenar');
const { ejecutarPrediccion } = require('../ml/predecir');

const generarHistoricoDemo = async (usuarioId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const productosRes = await client.query('SELECT id, categoria_id, precio_venta FROM productos WHERE activo = TRUE');
    const productos = productosRes.rows;

    let diasGenerados = 0;
    const hoy = new Date();

    for (let d = 60; d >= 1; d--) {
      const fechaObj = new Date(hoy);
      fechaObj.setDate(hoy.getDate() - d);
      const fechaStr = fechaObj.toISOString().split('T')[0];
      const diaSemana = fechaObj.getDay();
      const factorFinSemana = (diaSemana === 0 || diaSemana === 6) ? 1.35 : 1.0;

      const ventaRes = await client.query(
        'INSERT INTO ventas (fecha, usuario_id, total) VALUES ($1, $2, 0) RETURNING id',
        [fechaStr, usuarioId]
      );
      const ventaId = ventaRes.rows[0].id;
      let totalDia = 0;

      for (const prod of productos) {
        let base = 20;
        if (prod.categoria_id === 1) base = 130;
        else if (prod.categoria_id === 3) base = 30;
        else if (prod.categoria_id === 2) base = 12;
        else base = 16;

        const variacion = 0.85 + Math.random() * 0.3;
        const cantidad = Math.round(base * factorFinSemana * variacion);
        const subtotal = Number((cantidad * Number(prod.precio_venta)).toFixed(2));
        totalDia += subtotal;

        await client.query(
          `INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [ventaId, prod.id, cantidad, prod.precio_venta, subtotal]
        );
      }

      await client.query('UPDATE ventas SET total = $1 WHERE id = $2', [totalDia.toFixed(2), ventaId]);
      diasGenerados++;
    }

    await client.query('COMMIT');
    return diasGenerados;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

const entrenarYGuardarModelo = async (algoritmoSolicitado) => {
  let algoritmo = algoritmoSolicitado;
  if (!algoritmo) {
    const cfgRes = await pool.query("SELECT valor FROM configuracion WHERE clave = 'algoritmo_activo'");
    algoritmo = cfgRes.rows[0]?.valor || 'random_forest';
  }

  const histRes = await pool.query('SELECT * FROM v_demanda_diaria ORDER BY fecha ASC');
  const resultado = entrenarModelo(histRes.rows, algoritmo);

  await pool.query('UPDATE modelos_ml SET activo = FALSE');
  const insertRes = await pool.query(
    `INSERT INTO modelos_ml (algoritmo, metrica_mae, metrica_rmse, metrica_r2, activo, ruta_archivo)
     VALUES ($1, $2, $3, $4, TRUE, $5)
     RETURNING *`,
    [algoritmo, resultado.metricas.mae, resultado.metricas.rmse, resultado.metricas.r2, resultado.rutaArchivo]
  );

  return {
    modelo: insertRes.rows[0],
    filas_entrenamiento: resultado.totalFilas,
  };
};

const predecirParaFecha = async (fechaPrediccion, usuarioId) => {
  const modeloRes = await pool.query('SELECT * FROM modelos_ml WHERE activo = TRUE ORDER BY id DESC LIMIT 1');
  if (modeloRes.rows.length === 0) {
    throw new Error('No hay ningún modelo entrenado activo. Entrena un modelo primero.');
  }
  const modeloActivo = modeloRes.rows[0];

  const tempRes = await pool.query(
    'SELECT nombre FROM temporadas WHERE $1::DATE BETWEEN fecha_inicio AND fecha_fin LIMIT 1',
    [fechaPrediccion]
  );
  const temporada = tempRes.rows[0]?.nombre || 'Normal';

  const fechaObj = new Date(`${fechaPrediccion}T00:00:00`);
  const diaSemana = fechaObj.getDay();
  const mes = fechaObj.getMonth() + 1;

  const prodRes = await pool.query(
    `SELECT p.id AS producto_id, p.nombre AS producto, c.nombre AS categoria, p.precio_venta
     FROM productos p
     JOIN categorias c ON c.id = p.categoria_id
     WHERE p.activo = TRUE
     ORDER BY p.id ASC`
  );

  const entradas = prodRes.rows.map((p) => ({
    producto_id: p.producto_id,
    dia_semana: diaSemana,
    mes,
    temporada,
    precio_venta: p.precio_venta,
  }));

  const cantidades = ejecutarPrediccion(modeloActivo.ruta_archivo, entradas);

  const resultados = [];
  for (let i = 0; i < prodRes.rows.length; i++) {
    const prod = prodRes.rows[i];
    const estimada = cantidades[i];

    const ins = await pool.query(
      `INSERT INTO predicciones (fecha_prediccion, producto_id, cantidad_estimada, modelo_id, usuario_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [fechaPrediccion, prod.producto_id, estimada, modeloActivo.id, usuarioId]
    );

    resultados.push({
      prediccion_id: ins.rows[0].id,
      fecha_prediccion: fechaPrediccion,
      temporada,
      producto_id: prod.producto_id,
      producto: prod.producto,
      categoria: prod.categoria,
      cantidad_estimada: estimada,
    });
  }

  return {
    modelo_usado: modeloActivo.algoritmo,
    metrica_r2: modeloActivo.metrica_r2,
    temporada_detectada: temporada,
    predicciones: resultados,
  };
};

module.exports = { generarHistoricoDemo, entrenarYGuardarModelo, predecirParaFecha };
