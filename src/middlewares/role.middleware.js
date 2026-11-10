/**
 * Autorización por ROL. Úsalo cuando el acceso a un módulo completo
 * depende del rol (ej. solo "Administrador" puede ver /api/usuarios).
 * Debe ir SIEMPRE después de verifyAuth.
 */
function requireRole(...rolesPermitidos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const tieneRol = req.user.roles.some((rol) => rolesPermitidos.includes(rol));
    if (!tieneRol) {
      return res.status(403).json({
        error: 'No tienes permiso para acceder a este recurso',
        detalle: `Rol requerido: ${rolesPermitidos.join(' o ')}`,
      });
    }
    next();
  };
}
/**
 * Autorización por PERMISO. Más granular que el rol: permite proteger
 * una acción específica (ej. "productos.gestionar") sin importar el
 * nombre del rol que la otorgue.
 * Debe ir SIEMPRE después de verifyAuth.
 */
function requirePermission(...permisosRequeridos) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' });
    }

    const tieneTodos = permisosRequeridos.every((permiso) => req.user.permisos.includes(permiso));
    if (!tieneTodos) {
      return res.status(403).json({
        error: 'No tienes permiso para realizar esta acción',
        detalle: `Permiso requerido: ${permisosRequeridos.join(', ')}`,
      });
    }
    next();
  };
}

module.exports = { requireRole, requirePermission };
