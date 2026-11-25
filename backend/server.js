const app = require('./src/app');
const config = require('./src/config/env');
const { asegurarAdminInicial } = require('./src/controllers/auth.controller');

app.listen(config.port, async () => {
  console.log(`Servidor Biscochito Feliz escuchando en http://localhost:${config.port}`);
  try {
    await asegurarAdminInicial();
  } catch (err) {
    console.error('Error al verificar admin inicial:', err.message);
  }
});
