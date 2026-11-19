const { Sequelize } = require('sequelize');
require('dotenv').config();

const options = {
  dialect: 'mssql',
  logging: false,
  dialectOptions: {
    options: {
      encrypt: process.env.DB_ENCRYPT === 'true',
      trustServerCertificate: process.env.DB_TRUST_CERT !== 'false'
    }
  }
};

if (process.env.DB_INSTANCE) {
  options.dialectOptions.options.instanceName = process.env.DB_INSTANCE;
} else if (process.env.DB_PORT) {
  options.port = Number(process.env.DB_PORT);
}

const sequelize = new Sequelize(
  process.env.DB_NAME || 'CadastroProdutos',
  process.env.DB_USER || 'sa',
  process.env.DB_PASSWORD || '',
  { host: process.env.DB_HOST || 'localhost', ...options }
);

module.exports = sequelize;
