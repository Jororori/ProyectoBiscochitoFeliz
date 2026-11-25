const app = require('./src/app');
const config = require('./src/config/env');

app.listen(config.port, () => {
  console.log(`Servidor Biscochito Feliz escuchando en http://localhost:${config.port}`);
});