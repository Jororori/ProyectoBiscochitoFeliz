const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');
const { poblarHistorico, entrenar, predecir, historialPredicciones } = require('../controllers/prediccion.controller');

router.post('/poblar-historico', verificarToken, permitirRoles('Administrador'), poblarHistorico);
router.post('/entrenar', verificarToken, permitirRoles('Administrador'), entrenar);
router.post('/predecir', verificarToken, permitirRoles('Administrador'), predecir);
router.get('/historial', verificarToken, historialPredicciones);

module.exports = router;
