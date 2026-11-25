const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { reporteVentas, reportePredicciones } = require('../controllers/reportes.controller');

router.get('/ventas', verificarToken, reporteVentas);
router.get('/predicciones', verificarToken, reportePredicciones);

module.exports = router;
