# Tamy AI — Sistema simples de pedidos (NestJS + Next.js)

Pequeno sistema para bares/restaurantes com **autenticação**, **CRUD de produtos (com estoque)**, **pedidos** (itens, pagamento, status) e **dashboard** (faturamento, pedidos e ticket médio) **com filtros**.

---

## Stack

- **Backend:** NestJS + TypeScript • PostgreSQL • MikroORM • JWT  
- **Frontend:** Next.js 14 + TypeScript • Tailwind + shadcn/ui • React Hook Form + Zod

---

## Requisitos

- **Node.js 20+** e **npm**
- **PostgreSQL 13+** rodando local
- (Sem Docker)

---

## 1) Banco de Dados

Crie o banco/usuário (ajuste a porta se não for a padrão 5432):

```sql
CREATE DATABASE tamy;
CREATE USER tamy WITH ENCRYPTED PASSWORD 'tamy';
GRANT ALL PRIVILEGES ON DATABASE tamy TO tamy;

Dica (Windows): em muitas instalações o Postgres usa porta 5433. Veja no pgAdmin → Properties → Connection → Port e use essa porta no .env.

## 2) Backend
## 2.1) Variáveis de ambiente
Crie backend/.env
# PostgreSQL
DB_HOST=127.0.0.1
DB_PORT=5432           # use 5433 se seu Postgres estiver nessa porta
DB_NAME=tamy
DB_USER=tamy
DB_PASS=tamy

# Auth
JWT_SECRET=devsecret
JWT_EXPIRES=24h

# CORS (dev)
CORS_ORIGIN=http://localhost:3001

## 2.2 Instalar, migrar e rodar

cd backend
npm install
npx mikro-orm migration:up   # cria/atualiza o schema no banco
npm run start:dev
Se tudo ok, verá algo como:

Nest application successfully started
MikroORM connected to postgresql://...
##  2.3 Smoke Test (cURL)

# registrar usuário
curl -X POST http://localhost:3000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Admin","email":"admin@tamy.com","password":"123456"}'

# login (guarde o accessToken)
curl -X POST http://localhost:3000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@tamy.com","password":"123456"}'
Guarde o token:

# Git Bash (Windows) ou macOS/Linux
export TOKEN='COLE_O_TOKEN_AQUI'
Produtos de exemplo:

curl -X POST http://localhost:3000/products \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"X-Burger","price":"25.90","category":"comida","stock":10}'

curl -X POST http://localhost:3000/products \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Coca-Cola","price":"6.50","category":"bebida","stock":20}'

curl -X POST http://localhost:3000/products \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Pudim","price":"8.90","category":"sobremesa","stock":8}'
Criar um pedido:

curl -X POST http://localhost:3000/orders \
  -H 'Content-Type: application/json' -H "Authorization: Bearer $TOKEN" \
  -d '{"paymentMethod":"pix","status":"pago","items":[{"productId":1,"quantity":1},{"productId":2,"quantity":2}]}'
Dashboard (com filtros):

curl "http://localhost:3000/dashboard/summary?from=2025-08-11&to=2025-08-11&status=pago&payment=all" \
  -H "Authorization: Bearer $TOKEN"
##  2.4 Regras de Estoque
Criar pedido: estoque dos produtos é abatido conforme a quantidade dos itens.

Cancelar pedido (status=cancelado): estoque é devolvido.

Reabrir pedido cancelado (para aberto/pago): estoque é consumido novamente (falha se não houver quantidade suficiente).

A lógica roda de forma transacional no OrdersService.update.

##  3) Frontend
## 3.1 Variáveis de ambiente
Crie frontend/.env.local:


NEXT_PUBLIC_API_URL=http://localhost:3000
##  3.2 Instalar e rodar

cd ../frontend
npm install
npm run dev -- -p 3001
Acesse http://localhost:3001:

/register: cadastro

/login: autenticação

/products: CRUD + estoque

/orders/new: criar pedido (respeita estoque)

/orders: lista pedidos com ações:

“!” ver itens (Dialog)

✓ marcar como pago (habilita somente quando “aberto”)

× cancelar (vermelho, desabilitado quando já cancelado)

/dashboard: filtros (De/Até, Status, Pagamento) + cards (Pedidos, Faturamento, Ticket médio)

Componentes do shadcn/ui já estão versionados.
Se faltar algum durante o desenvolvimento:

npx shadcn@latest add dialog select input button badge table card

Scripts úteis

Backend
npm run start:dev
npx mikro-orm debug
npx mikro-orm migration:create
npx mikro-orm migration:up

Frontend
npm run dev -- -p 3001
Estrutura do Projeto (resumo)

backend/
  src/
    auth/               # login/registro/me (JWT)
    entities/           # User, Product, Order, OrderItem
    products/           # CRUD + validações
    orders/             # criar/listar/atualizar (estoque)
    dashboard/          # /dashboard/summary (filtros)
    migrations/
  mikro-orm.config.ts
  .env

frontend/
  src/
    app/
      (auth)/
        login/
        register/
      (private)/
        dashboard/
        products/
          [id]/edit/
          new/
        orders/
          new/
    components/
      ui/               # shadcn components
    lib/api.ts
  .env.local

Troubleshooting 

Porta ocupada
Backend: 3000; Frontend: 3001 (ou use -- -p 3005)
Windows (PowerShell):
netstat -ano | findstr :3000
taskkill /PID <PID> /F

Next: EPERM .next/trace (Windows)
rmdir /S /Q .next
rmdir /S /Q .turbo

MikroORM “No entities found”
npx mikro-orm cache:clear
npx mikro-orm debug

401 no frontend
Faça login em /login (token salvo em localStorage).

Workflow de Branches (usado)

Branches por feature:
- feat/backend-auth, feat/backend-products, feat/backend-orders,
- feat/backend-dashboard, feat/backend-stock,
- feat/frontend-auth, feat/frontend-products, feat/frontend-orders, etc.

PRs com descrição do que foi entregue.