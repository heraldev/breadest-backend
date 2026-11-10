const configModel = require('../models/config.model');

const CLAVE_BANNER = 'banner_temporada_activo';

/** GET /api/configuracion/banner-temporada — pública, la consulta el front */
async function obtenerBannerTemporada(req, res, next) {
  try {
    const valor = await configModel.getValor(CLAVE_BANNER);
    // Si nunca se ha configurado, se asume activo por defecto
    res.json({ activo: valor === null ? true : valor === '1' });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/configuracion/banner-temporada — Editor o Administrador */
async function actualizarBannerTemporada(req, res, next) {
  try {
    const { activo } = req.body;

    if (typeof activo !== 'boolean') {
      return res.status(400).json({ error: 'El campo "activo" debe ser true o false' });
    }

    await configModel.setValor(CLAVE_BANNER, activo ? '1' : '0');
    res.json({ mensaje: `Banner de temporada ${activo ? 'activado' : 'desactivado'} correctamente` });
  } catch (err) {
    next(err);
  }
}

module.exports = { obtenerBannerTemporada, actualizarBannerTemporada };