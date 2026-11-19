# API de Produtos — Node.js + SQL Server Express

## Nota importante sobre a tecnologia
Entity Framework é um ORM do ecossistema .NET e não é utilizado diretamente em Node.js. Para manter a API em Node.js e persistir no SQL Server, este projeto usa Sequelize com o driver `mssql`. Se os vídeos da Semana 15 exigirem literalmente Entity Framework, confirme com o professor se a linguagem correta seria C#/.NET.

## Requisitos
- Node.js LTS
- SQL Server Express
- SQL Server Management Studio (SSMS), opcional
- Postman

## 1. Criar o banco
No SSMS, conecte ao SQL Server Express e execute:
```sql
CREATE DATABASE CadastroProdutos;
GO
```
O Sequelize cria a tabela `Produtos` ao iniciar a API.

## 2. Configurar conexão
Copie `.env.example` para `.env` e ajuste host, porta, banco, usuário e senha.
- Para instância nomeada, preencha `DB_INSTANCE` (por exemplo, `SQLEXPRESS`) e deixe `DB_PORT` em branco.
- Para autenticação Windows, este exemplo precisa ser adaptado; por padrão usa autenticação SQL Server.
- Ative TCP/IP e confirme a porta no SQL Server Configuration Manager, se necessário.

## 3. Instalar e executar
```bash
npm install
npm start
```
API: `http://localhost:3000`
Teste de saúde: `GET http://localhost:3000/health`

## Rotas
- `POST /api/produtos` — cria produto
- `GET /api/produtos` — lista todos
- `GET /api/produtos/codigo/:codigo` — busca pelo código
- `GET /api/produtos/categoria/:categoria` — busca por categoria
- `PUT /api/produtos/:id` — atualiza por ID numérico
- `DELETE /api/produtos/:id` — exclui por ID numérico

A ordem das rotas está definida para que `codigo` e `categoria` não sejam interpretados como `:id`.

## Exemplo de corpo POST
```json
{
  "nome": "Caderno universitário",
  "codigo": "CODIGO_PESSOA_REAL",
  "preco": 24.9,
  "descricao": "Caderno de 10 matérias, capa azul",
  "quantidadeEstoque": 35,
  "avaliacao": 4.5,
  "categoria": "Papelaria"
}
```
**Importante:** substitua `CODIGO_PESSOA_REAL` pelo seu código de pessoa real para cumprir a atividade. Use valores próprios e diferentes dos colegas.

## Observações
- Os dados ficam persistidos no SQL Server; não são armazenados apenas em memória.
- A API valida campos obrigatórios, preço/estoque não negativos e avaliação entre 0 e 5.
- Para a entrega, execute os testes no seu ambiente e insira capturas reais do Postman no PDF. O relatório fornecido é um roteiro, não comprovação de testes executados.


## Front-end (atividade das duas páginas)
O front-end fica em `public/` e é servido pelo próprio Express. Inicie a API e acesse `http://localhost:3000`. A Home exibe os 12 produtos mais recentes, carrossel, cadastro em modal e cards; a página `detalhes.html?id=ID` exibe detalhes, edição e exclusão com confirmação.

### Imagens
O cadastro aceita `imagemUrl` (URL pública da imagem). Para produtos já existentes, o campo pode ficar vazio; nesse caso será exibido um espaço reservado. A tabela recebe a coluna `imagemUrl` quando o Sequelize sincronizar o modelo.

### Rotas adicionais usadas pelo front-end
- `GET /api/produtos?limite=12` — últimos 12 produtos.
- `GET /api/produtos/:id` — detalhes por ID numérico.

## Trabalho Prático — Front-end integrado (tela de gerenciamento)
Acesse `http://localhost:3000/gerenciar.html` (link "Gerenciar" no menu).

- **CRUD completo** via modais: cadastro (`POST`), edição (`PUT /:id`), exclusão com confirmação (`DELETE /:id`).
- **Filtros** (`GET /api/produtos?...`): nome, categoria, faixa de preço, avaliação mínima, estoque máximo e ordenação.
- **Busca por código** → `GET /api/produtos/codigo/:codigo`.
- **Painel de resumo** → `GET /api/produtos/resumo` (COUNT/SUM/AVG e GROUP BY por categoria).
- **Dados fictícios**: `npm run seed`.
