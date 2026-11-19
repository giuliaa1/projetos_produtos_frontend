const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const Produto = sequelize.define('Produto', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  nome: { type: DataTypes.STRING(120), allowNull: false },
  codigo: { type: DataTypes.STRING(60), allowNull: false, unique: true },
  preco: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  descricao: { type: DataTypes.STRING(1000), allowNull: false },
  quantidadeEstoque: { type: DataTypes.INTEGER, allowNull: false },
  avaliacao: { type: DataTypes.DECIMAL(2, 1), allowNull: false },
  categoria: { type: DataTypes.STRING(80), allowNull: false },
  imagemUrl: { type: DataTypes.STRING(1000), allowNull: true }
}, {
  tableName: 'Produtos',
  timestamps: true
});

module.exports = Produto;
