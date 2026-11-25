const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');
const { obtenerRecomendacion, registrarProduccion, listarProduccion } = require('../controllers/produccion.controller');

router.get('/', verificarToken, listarProduccion);
router.get('/recomendacion', verificarToken, obtenerRecomendacion);
router.post('/', verificarToken, permitirRoles('Administrador'), registrarProduccion);

module.exports = router;
