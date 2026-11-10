const userModel = require('../models/user.model');
const roleModel = require('../models/role.model');

/** GET /api/usuarios — Listado de usuarios (solo Administrador)
 *  Soporta ?rol=Editor para filtrar, ej. el panel de admin que solo
 *  necesita ver/activar/desactivar editores.
 */
async function listarUsuarios(req, res, next) {
  try {
    const { rol } = req.query;
    const usuarios = rol ? await userModel.findAllByRole(rol) : await userModel.findAll();
    res.json({ usuarios });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/usuarios/:id/estado — Activar o desactivar el acceso de un usuario */
async function cambiarEstado(req, res, next) {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo "activo" debe ser true o false' });
    }

    const usuario = await userModel.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Un administrador no debería poder desactivarse a sí mismo por error
    if (Number(id) === req.user.id && activo === false) {
      return res.status(400).json({ error: 'No puedes desactivar tu propia cuenta' });
    }

    await userModel.setActivo(id, activo);
    res.json({ mensaje: `Usuario ${activo ? 'activado' : 'desactivado'} correctamente` });
  } catch (err) {
    next(err);
  }
}

/** GET /api/usuarios/:id — Detalle de un usuario, con sus roles */
async function obtenerUsuario(req, res, next) {
  try {
    const { id } = req.params;
    const usuario = await userModel.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    const roles = await userModel.getRolesByUserId(id);
    res.json({ usuario: { ...usuario, roles } });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/usuarios/:id/rol — Asignar un rol a un usuario */
async function asignarRol(req, res, next) {
  try {
    const { id } = req.params;
    const { rol } = req.body;

    if (!rol) {
      return res.status(400).json({ error: 'Debes indicar el nombre del rol a asignar' });
    }

    const usuario = await userModel.findById(id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const rolEncontrado = await roleModel.findByName(rol);
    if (!rolEncontrado) {
      return res.status(400).json({ error: `El rol "${rol}" no existe` });
    }

    await userModel.assignRole(id, rolEncontrado.id);
    res.json({ mensaje: `Rol "${rol}" asignado correctamente al usuario ${id}` });
  } catch (err) {
    next(err);
  }
}

module.exports = { listarUsuarios, obtenerUsuario, asignarRol, cambiarEstado };