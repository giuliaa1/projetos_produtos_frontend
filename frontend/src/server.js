require('dotenv').config();
const express = require('express');
const sequelize = require('./database');
require('./models/Produto');
const produtosRouter = require('./routes/produtos');

const path = require('path');
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.get('/', (_req, res) => res.sendFile(path.join(__dirname, '../public/index.html')));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/produtos', produtosRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ erro: 'Erro interno ao processar a solicitação.' });
});

const port = Number(process.env.PORT || 3000);
(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('Conectado ao SQL Server; tabela Produtos sincronizada.');
    app.listen(port, () => console.log(`API disponível em http://localhost:${port}`));
  } catch (err) {
    console.error('Falha ao conectar ao SQL Server. Confira o arquivo .env e a configuração do SQL Server.', err.message);
    process.exit(1);
  }
})();
