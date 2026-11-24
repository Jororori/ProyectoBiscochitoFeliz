require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || 'jwt_secreto_biscochito_feliz_2026',
  db: {
    host: process.env.DB_HOST || 'db',
    port: Number(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'panaderia',
    user: process.env.DB_USER || 'admin',
    password: process.env.DB_PASSWORD,
  },
};