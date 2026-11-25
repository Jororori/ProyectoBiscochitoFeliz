const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');
const { listarTemporadas, crearTemporada, eliminarTemporada } = require('../controllers/temporadas.controller');

router.get('/', verificarToken, listarTemporadas);
router.post('/', verificarToken, permitirRoles('Administrador'), crearTemporada);
router.delete('/:id', verificarToken, permitirRoles('Administrador'), eliminarTemporada);

module.exports = router;
