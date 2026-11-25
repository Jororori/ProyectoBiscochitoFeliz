const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const config = require('../config/env');

const asegurarAdminInicial = async () => {
  const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', ['admin@biscochitofeliz.com']);
  if (existe.rows.length === 0) {
    const rolRes = await pool.query("SELECT id FROM roles WHERE nombre = 'Administrador'");
    const rolId = rolRes.rows[0]?.id || 1;
    const hash = await bcrypt.hash('Admin2026*', 10);
    await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol_id) VALUES ($1, $2, $3, $4)',
      ['Administrador General', 'admin@biscochitofeliz.com', hash, rolId]
    );
    console.log('Usuario admin inicial creado: admin@biscochitofeliz.com / Admin2026*');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ ok: false, mensaje: 'Debes ingresar email y contraseña.' });
    }

    const query = `
      SELECT u.id, u.nombre, u.email, u.password_hash, u.activo, r.nombre AS rol
      FROM usuarios u
      JOIN roles r ON r.id = u.rol_id
      WHERE u.email = $1
    `;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    const usuario = result.rows[0];
    if (!usuario.activo) {
      return res.status(403).json({ ok: false, mensaje: 'Usuario desactivado.' });
    }

    const passwordValido = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordValido) {
      return res.status(401).json({ ok: false, mensaje: 'Credenciales incorrectas.' });
    }

    const payload = {
      id: usuario.id,
      nombre: usuario.nombre,
      email: usuario.email,
      rol: usuario.rol,
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '8h' });

    res.json({ ok: true, token, usuario: payload });
  } catch (error) {
    res.status(500).json({ ok: false, mensaje: error.message });
  }
};

const me = async (req, res) => {
  res.json({ ok: true, usuario: req.usuario });
};

module.exports = { asegurarAdminInicial, login, me };
