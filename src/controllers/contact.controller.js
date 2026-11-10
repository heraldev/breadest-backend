const nodemailer = require('nodemailer');
// const pool = require('../config/db'); // Descomenta si deseas guardar también en tu BD MySQL

/**
 * Procesa el envío del formulario de contacto
 */
const enviarContacto = async (req, res) => {
  const { nombre, correo, mensaje } = req.body;

  // 1. Validación básica
  if (!nombre || !correo || !mensaje) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    // 2. (Opcional) Guardar en Base de Datos MySQL
    // await pool.query(
    //   'INSERT INTO contactos (nombre, correo, mensaje) VALUES (?, ?, ?)',
    //   [nombre, correo, mensaje]
    // );

    // 3. Configurar el transportador de correo (SMTP)
    // Para pruebas puedes usar Gmail (requiere contraseña de aplicación de Google) 
    // o las credenciales SMTP de tu servidor VPS / hosting.
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 465,
      secure: true, // true para puerto 465, false para otros puertos
      auth: {
        user: process.env.EMAIL_USER, // Tu correo
        pass: process.env.EMAIL_PASS  // Tu contraseña o App Password
      }
    });

    // 4. Estructura del correo
    const mailOptions = {
      from: `"${nombre} vía Trigo & Miel" <${process.env.EMAIL_USER}>`, // Sale desde tu correo
      to: process.env.EMAIL_USER, // Te llega a ti mismo
      replyTo: correo, // Al hacer clic en "Responder", le responderás directamente al usuario
      subject: `Nuevo mensaje de contacto de: ${nombre}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #2a1d14;">
          <h2 style="color: #a9784c;">Nuevo Mensaje de Contacto - Trigo & Miel</h2>
          <p><strong>Nombre:</strong> ${nombre}</p>
          <p><strong>Correo de contacto:</strong> <a href="mailto:${correo}">${correo}</a></p>
          <p><strong>Mensaje:</strong></p>
          <blockquote style="background: #faf6f0; padding: 15px; border-left: 4px solid #a9784c; margin: 0;">
            ${mensaje}
          </blockquote>
          <hr style="margin-top: 20px; border: 0; border-top: 1px solid #e4cba3;" />
          <p style="font-size: 12px; color: #5c3a21;">Este mensaje fue generado automáticamente desde el sitio web.</p>
        </div>
      `
    };

    // 5. Enviar el email
    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado y registrado correctamente'
    });

  } catch (error) {
    console.error('Error al enviar correo de contacto:', error);
    return res.status(500).json({
      error: 'Error interno al procesar el mensaje de contacto.'
    });
  }
};

module.exports = {
  enviarContacto
};