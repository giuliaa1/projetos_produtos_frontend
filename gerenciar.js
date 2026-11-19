const API = '/api/produtos';
const $ = (id) => document.getElementById(id);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const brl = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const modalForm = new bootstrap.Modal($('modalForm'));
const modalExcluir = new bootstrap.Modal($('modalExcluir'));
let editandoId = null, excluirId = null;

function aviso(texto, tipo = 'success') {
  const m = $('mensagem');
  m.className = `alert alert-${tipo}`;
  m.textContent = texto;
  setTimeout(() => m.classList.add('d-none'), 4000);
}

async function req(url, opts) {
  const r = await fetch(url, opts);
  const corpo = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(corpo.erro || 'Erro na requisição.');
  return corpo;
}

function renderTabela(lista) {
  $('contador').textContent = `${lista.length} produto(s) encontrado(s)`;
  $('tabela').innerHTML = lista.length ? lista.map(p => `
    <tr>
      <td><code>${esc(p.codigo)}</code></td>
      <td><a class="text-decoration-none" href="detalhes.html?id=${p.id}">${esc(p.nome)}</a></td>
      <td><span class="badge text-bg-secondary">${esc(p.categoria)}</span></td>
      <td class="text-end">${brl(p.preco)}</td>
      <td class="text-end ${p.quantidadeEstoque <= 5 ? 'text-danger fw-bold' : ''}">${p.quantidadeEstoque}</td>
      <td>★ ${Number(p.avaliacao).toFixed(1)}</td>
      <td class="text-end text-nowrap">
        <button class="btn btn-sm btn-outline-primary" data-acao="editar" data-id="${p.id}">Editar</button>
        <button class="btn btn-sm btn-outline-danger" data-acao="excluir" data-id="${p.id}">Excluir</button>
      </td>
    </tr>`).join('') : '<tr><td colspan="7" class="text-center text-secondary py-4">Nenhum produto encontrado.</td></tr>';
  window.__lista = lista;
}

async function carregarLista() {
  const params = new URLSearchParams();
  new FormData($('filtros')).forEach((v, k) => { if (v !== '') params.append(k, v); });
  try { renderTabela(await req(`${API}?${params}`)); }
  catch (e) { aviso(e.message, 'danger'); }
}

async function carregarResumo() {
  try {
    const { geral, porCategoria } = await req(`${API}/resumo`);
    const cards = [
      ['Produtos', geral.totalProdutos ?? 0],
      ['Unidades em estoque', geral.totalUnidades ?? 0],
      ['Valor em estoque', brl(geral.valorEstoque ?? 0)],
      ['Avaliação média', Number(geral.avaliacaoMedia ?? 0).toFixed(2)],
      ['Estoque baixo (≤ 5)', geral.estoqueBaixo ?? 0]
    ];
    $('resumo').innerHTML = cards.map(([t, v]) => `<div class="col-6 col-lg"><div class="card card-body h-100"><div class="text-secondary small">${t}</div><div class="h4 fw-bold mb-0">${esc(v)}</div></div></div>`).join('');
    const max = Math.max(1, ...porCategoria.map(c => Number(c.quantidade)));
    $('grafico').innerHTML = porCategoria.map(c => `
      <div class="d-flex align-items-center mb-1">
        <div style="width:130px">${esc(c.categoria)}</div>
        <div class="progress flex-grow-1" style="height:18px"><div class="progress-bar" style="width:${(c.quantidade / max) * 100}%">${c.quantidade}</div></div>
        <div class="ms-2 text-secondary" style="width:130px">média ${brl(c.precoMedio)}</div>
      </div>`).join('') || '<span class="text-secondary">Sem dados.</span>';
    const cats = porCategoria.map(c => c.categoria);
    const atual = $('selCategoria').value;
    $('selCategoria').innerHTML = '<option value="">Todas</option>' + cats.map(c => `<option>${esc(c)}</option>`).join('');
    $('selCategoria').value = atual;
    $('listaCategorias').innerHTML = cats.map(c => `<option value="${esc(c)}">`).join('');
  } catch (e) { aviso(e.message, 'danger'); }
}

function abrirForm(p) {
  editandoId = p ? p.id : null;
  $('tituloModal').textContent = p ? 'Editar produto' : 'Novo produto';
  $('erroForm').classList.add('d-none');
  const f = $('formProduto');
  f.reset();
  if (p) for (const el of f.elements) if (el.name) el.value = p[el.name] ?? '';
  modalForm.show();
}

$('btnNovo').onclick = () => abrirForm(null);

$('tabela').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-acao]');
  if (!b) return;
  const p = window.__lista.find(x => x.id === Number(b.dataset.id));
  if (b.dataset.acao === 'editar') abrirForm(p);
  else { excluirId = p.id; $('nomeExcluir').textContent = p.nome; modalExcluir.show(); }
});

$('formProduto').addEventListener('submit', async (e) => {
  e.preventDefault();
  const dados = Object.fromEntries(new FormData(e.target));
  if (!dados.imagemUrl) dados.imagemUrl = null;
  try {
    await req(editandoId ? `${API}/${editandoId}` : API, {
      method: editandoId ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados)
    });
    modalForm.hide();
    aviso(editandoId ? 'Produto atualizado.' : 'Produto cadastrado.');
    await Promise.all([carregarLista(), carregarResumo()]);
  } catch (err) {
    $('erroForm').textContent = err.message;
    $('erroForm').classList.remove('d-none');
  }
});

$('confirmaExcluir').onclick = async () => {
  try {
    await req(`${API}/${excluirId}`, { method: 'DELETE' });
    modalExcluir.hide();
    aviso('Produto excluído.');
    await Promise.all([carregarLista(), carregarResumo()]);
  } catch (err) { modalExcluir.hide(); aviso(err.message, 'danger'); }
};

$('filtros').addEventListener('submit', (e) => { e.preventDefault(); carregarLista(); });
$('btnLimpar').onclick = () => { $('filtros').reset(); carregarLista(); };

$('buscaCodigo').addEventListener('submit', async (e) => {
  e.preventDefault();
  const cod = $('codigoBusca').value.trim();
  if (!cod) return carregarLista();
  try { renderTabela([await req(`${API}/codigo/${encodeURIComponent(cod)}`)]); }
  catch (err) { renderTabela([]); aviso(err.message, 'warning'); }
});

carregarResumo();
carregarLista();
