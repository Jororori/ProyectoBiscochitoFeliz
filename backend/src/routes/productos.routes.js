const express = require('express');
const router = express.Router();
const verificarToken = require('../middlewares/auth.middleware');
const permitirRoles = require('../middlewares/role.middleware');
const {
  listarProductos,
  listarCategorias,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
} = require('../controllers/productos.controller');

router.get('/', verificarToken, listarProductos);
router.get('/categorias', verificarToken, listarCategorias);
router.post('/', verificarToken, permitirRoles('Administrador'), crearProducto);
router.put('/:id', verificarToken, permitirRoles('Administrador'), actualizarProducto);
router.delete('/:id', verificarToken, permitirRoles('Administrador'), eliminarProducto);

module.exports = router;
