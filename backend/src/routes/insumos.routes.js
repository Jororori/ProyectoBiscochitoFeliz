const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');
const { listarInsumos, crearInsumo, actualizarInsumo, eliminarInsumo } = require('../controllers/insumos.controller');

router.get('/', verificarToken, listarInsumos);
router.post('/', verificarToken, permitirRoles('Administrador'), crearInsumo);
router.put('/:id', verificarToken, permitirRoles('Administrador'), actualizarInsumo);
router.delete('/:id', verificarToken, permitirRoles('Administrador'), eliminarInsumo);

module.exports = router;
