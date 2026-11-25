const pool = require('../config/db');
const { generarHistoricoDemo, entrenarYGuardarModelo, predecirParaFecha } = require('../services/prediccion.service');

const poblarHistorico = async (req, res) => {
  try {
    const dias = await generarHistoricoDemo(req.usuario.id);
    res.json({ ok: true, mensaje: `Se generaron ${dias} días de ventas históricas para entrenamiento.` });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const entrenar = async (req, res) => {
  try {
    const { algoritmo } = req.body || {};
    const resultado = await entrenarYGuardarModelo(algoritmo);
    res.json({ ok: true, mensaje: 'Modelo entrenado exitosamente.', ...resultado });
  } catch (error) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

const predecir = async (req, res) => {
  try {
    const { fecha } = req.body;
    if (!fecha) {
      return res.status(400).json({ ok: false, mensaje: 'Debes indicar la fecha a predecir (YYYY-MM-DD).' });
    }
    const resultado = await predecirParaFecha(fecha, req.usuario.id);
    res.json({ ok: true, ...resultado });
  } catch (error) {
    res.status(400).json({ ok: false, mensaje: error.message });
  }
};

const historialPredicciones = async (req, res) => {
  try {
    const query = `
      SELECT pr.id, pr.fecha_prediccion, p.nombre AS producto, pr.cantidad_estimada,
             m.algoritmo, u.nombre AS usuario, pr.created_at
      FROM predicciones pr
      JOIN productos p ON p.id = pr.producto_id
      JOIN modelos_ml m ON m.id = pr.modelo_id
      JOIN usuarios u ON u.id = pr.usuario_id
      ORDER BY pr.created_at DESC, pr.id DESC
      LIMIT 100
    `;
    const result = await pool.query(query);
    res.json({ ok: true, historial: result.rows });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

module.exports = { poblarHistorico, entrenar, predecir, historialPredicciones };
