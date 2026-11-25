const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({
        ok: false,
        mensaje: 'No tienes permisos suficientes para realizar esta acción.',
      });
    }
    next();
  };
};

module.exports = permitirRoles;
