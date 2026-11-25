const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const {
  listarVentas,
  obtenerVentaPorId,
  registrarVenta,
  obtenerDemandaDiaria,
} = require('../controllers/ventas.controller');

router.get('/', verificarToken, listarVentas);
router.get('/demanda-diaria', verificarToken, obtenerDemandaDiaria);
router.get('/:id', verificarToken, obtenerVentaPorId);
router.post('/', verificarToken, registrarVenta);

module.exports = router;
