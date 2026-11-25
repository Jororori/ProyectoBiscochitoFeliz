const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const { obtenerResumen, topProductos, ventasMensuales } = require('../controllers/dashboard.controller');

router.get('/resumen', verificarToken, obtenerResumen);
router.get('/top-productos', verificarToken, topProductos);
router.get('/ventas-mensuales', verificarToken, ventasMensuales);

module.exports = router;
