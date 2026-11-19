const express = require('express');
const { Op } = require('sequelize');
const Produto = require('../models/Produto');
const router = express.Router();

function validar(body, parcial = false) {
  const obrigatorios = ['nome', 'codigo', 'preco', 'descricao', 'quantidadeEstoque', 'avaliacao', 'categoria'];
  if (!parcial) {
    const faltando = obrigatorios.filter(k => body[k] === undefined || body[k] === null || body[k] === '');
    if (faltando.length) return `Campos obrigatórios ausentes: ${faltando.join(', ')}`;
  }
  if (body.preco !== undefined && (!Number.isFinite(Number(body.preco)) || Number(body.preco) < 0)) return 'preco deve ser um número maior ou igual a zero.';
  if (body.quantidadeEstoque !== undefined && (!Number.isInteger(Number(body.quantidadeEstoque)) || Number(body.quantidadeEstoque) < 0)) return 'quantidadeEstoque deve ser um inteiro maior ou igual a zero.';
  if (body.avaliacao !== undefined && (!Number.isFinite(Number(body.avaliacao)) || Number(body.avaliacao) < 0 || Number(body.avaliacao) > 5)) return 'avaliacao deve estar entre 0 e 5.';
  return null;
}

router.post('/', async (req, res, next) => {
  try {
    const erro = validar(req.body);
    if (erro) return res.status(400).json({ erro });
    const produto = await Produto.create(req.body);
    return res.status(201).json(produto);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ erro: 'Já existe produto com esse código.' });
    next(e);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const q = req.query;
    const where = {};
    if (q.nome) where.nome = { [Op.like]: `%${q.nome}%` };
    if (q.codigo) where.codigo = { [Op.like]: `%${q.codigo}%` };
    if (q.categoria) where.categoria = { [Op.like]: q.categoria };
    const faixa = (campo, min, max) => {
      const c = {};
      if (min !== undefined && min !== '' && Number.isFinite(Number(min))) c[Op.gte] = Number(min);
      if (max !== undefined && max !== '' && Number.isFinite(Number(max))) c[Op.lte] = Number(max);
      if (Reflect.ownKeys(c).length) where[campo] = c;
    };
    faixa('preco', q.precoMin, q.precoMax);
    faixa('quantidadeEstoque', q.estoqueMin, q.estoqueMax);
    faixa('avaliacao', q.avaliacaoMin, undefined);
    const ordens = {
      recentes: [['createdAt', 'DESC'], ['id', 'DESC']],
      nome: [['nome', 'ASC']],
      menorPreco: [['preco', 'ASC']],
      maiorPreco: [['preco', 'DESC']],
      melhorAvaliacao: [['avaliacao', 'DESC']],
      menorEstoque: [['quantidadeEstoque', 'ASC']]
    };
    const limite = Math.min(Math.max(Number.parseInt(q.limite || '0', 10) || 0, 0), 100);
    const opcoes = { where, order: ordens[q.ordem] || ordens.recentes };
    if (limite) opcoes.limit = limite;
    res.json(await Produto.findAll(opcoes));
  } catch (e) { next(e); }
});

// Consulta agregada (GROUP BY) usada pelo painel de resumo do front-end.
router.get('/resumo', async (_req, res, next) => {
  try {
    const { fn, col, literal } = require('sequelize');
    const [geral] = await Produto.findAll({
      attributes: [
        [fn('COUNT', col('id')), 'totalProdutos'],
        [fn('SUM', col('quantidadeEstoque')), 'totalUnidades'],
        [fn('SUM', literal('preco * quantidadeEstoque')), 'valorEstoque'],
        [fn('AVG', col('avaliacao')), 'avaliacaoMedia'],
        [fn('SUM', literal('CASE WHEN quantidadeEstoque <= 5 THEN 1 ELSE 0 END')), 'estoqueBaixo']
      ], raw: true
    });
    const porCategoria = await Produto.findAll({
      attributes: ['categoria', [fn('COUNT', col('id')), 'quantidade'], [fn('AVG', col('preco')), 'precoMedio']],
      group: ['categoria'], order: [[fn('COUNT', col('id')), 'DESC']], raw: true
    });
    res.json({ geral, porCategoria });
  } catch (e) { next(e); }
});

router.get('/:id(\\d+)', async (req, res, next) => {
  try { const produto = await Produto.findByPk(req.params.id); if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' }); res.json(produto); } catch (e) { next(e); }
});

router.get('/codigo/:codigo', async (req, res, next) => {
  try {
    const produto = await Produto.findOne({ where: { codigo: req.params.codigo } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado para esse código.' });
    res.json(produto);
  } catch (e) { next(e); }
});

router.get('/categoria/:categoria', async (req, res, next) => {
  try {
    const produtos = await Produto.findAll({
      where: { categoria: { [Op.like]: req.params.categoria } },
      order: [['createdAt', 'DESC'], ['id', 'DESC']]
    });
    res.json(produtos);
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const erro = validar(req.body);
    if (erro) return res.status(400).json({ erro });
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
    await produto.update(req.body);
    res.json(produto);
  } catch (e) {
    if (e.name === 'SequelizeUniqueConstraintError') return res.status(409).json({ erro: 'Já existe produto com esse código.' });
    next(e);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const produto = await Produto.findByPk(req.params.id);
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
    await produto.destroy();
    res.status(200).json({ mensagem: 'Produto excluído com sucesso.', id: Number(req.params.id) });
  } catch (e) { next(e); }
});

module.exports = router;
