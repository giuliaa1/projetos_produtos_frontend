// Popula o banco com dados fictícios: npm run seed
require('dotenv').config();
const sequelize = require('./database');
const Produto = require('./models/Produto');

const dados = [
  ['Caderno universitário 10 matérias', 'PAP-001', 24.9, 'Capa dura azul, 200 folhas', 35, 4.5, 'Papelaria'],
  ['Caneta esferográfica azul (cx 50)', 'PAP-002', 39.9, 'Ponta média 1.0mm', 4, 4.2, 'Papelaria'],
  ['Mochila notebook 15"', 'ACE-001', 189.9, 'Impermeável, 3 compartimentos', 12, 4.7, 'Acessórios'],
  ['Mouse sem fio', 'INF-001', 79.9, 'Sensor óptico 1600 DPI', 25, 4.3, 'Informática'],
  ['Teclado mecânico ABNT2', 'INF-002', 259.0, 'Switch azul, retroiluminado', 8, 4.8, 'Informática'],
  ['Monitor 24" Full HD', 'INF-003', 799.0, 'IPS 75Hz HDMI', 3, 4.6, 'Informática'],
  ['Fone de ouvido Bluetooth', 'ELE-001', 149.9, 'Autonomia de 20h', 40, 4.1, 'Eletrônicos'],
  ['Carregador USB-C 20W', 'ELE-002', 59.9, 'Carga rápida', 60, 4.4, 'Eletrônicos'],
  ['Garrafa térmica 500ml', 'CAS-001', 69.9, 'Aço inox, mantém 12h', 18, 4.9, 'Casa'],
  ['Luminária de mesa LED', 'CAS-002', 94.5, 'Três níveis de brilho', 0, 3.9, 'Casa']
];

(async () => {
  await sequelize.sync();
  for (const [nome, codigo, preco, descricao, quantidadeEstoque, avaliacao, categoria] of dados) {
    await Produto.findOrCreate({ where: { codigo }, defaults: { nome, codigo, preco, descricao, quantidadeEstoque, avaliacao, categoria } });
  }
  console.log('Seed concluído.');
  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
