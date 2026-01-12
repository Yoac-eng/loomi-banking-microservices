## Loomi Banking Challenge - Banking Microservices (Node/NestJS)

Este repositório implementa um ecossistema bancário distribuído em dois microsserviços (Clients e Transactions), com foco em consistência de dados, desacoplamento e testabilidade.

## Relatório de Progresso

### Backlog e plataforma de gestão
- **ClickUp**: [board/lista do projeto](https://app.clickup.com/90132914161/v/s/901312622515)

### Como organizei demandas e atividades
Organizei as entregas priorizando decisões de alto nível (modelagem de fluxo, comunicação entre serviços, modelagem de dados e arquitetura) antes de passar para implementações. Em seguida, priorizei o módulo de Clients (core banking e fonte da verdade financeira) para então evoluir o fluxo principal de Transactions, finalizando com cache, mensageria, autenticação, documentação e testes.

### Como priorizei as entregas
- **Risco primeiro**: fluxo de dinheiro, idempotência e consistência entre serviços.
- **Experiência do avaliador**: Swagger + instruções claras de execução/testes.
- **Segurança e contratos**: autenticação JWT, tipagem/contratos e validação de entrada.
- **Testabilidade**: Clean Architecture e testes unitários dos casos de uso.

### Principais dificuldades e como lidei
- **Migrations do Prisma**: alterações de schema para `BigInt` e migrações por serviço.
- **Cache (Redis) vs estado do banco**: identificação de leituras “cache-first” gerando respostas desatualizadas após edições manuais no Postgres; estratégia de invalidação/limpeza para testes.
- **Idempotência**: garantir repetibilidade de requests e retorno determinístico quando a mesma chave é reutilizada.

### O que faria diferente com mais tempo
- **E2E por serviço** (com Docker Compose em CI) cobrindo os fluxos completos.
- **Observabilidade** (logs estruturados, tracing entre serviços).
- **Resiliência na mensageria** (retries, DLQ, backoff, idempotência do consumidor).
- **Estratégia formal de cache invalidation** (TTL + invalidação por eventos).

## Serviços

### Clients Service (`apps/clients`)
- **Responsabilidade**: identidade do usuário e “fonte da verdade” financeira (saldo via ledger).
- **Infra**: Postgres + Redis.
- **API**: gerenciamento de usuários e detalhes bancários; autenticação (login).

### Transactions Service (`apps/transactions`)
- **Responsabilidade**: orquestração de transferências.
- **Infra**: Postgres + Redis + RabbitMQ.
- **API**: criação/consulta de transações.
- **Comunicação**:
  - **HTTP**: consulta de dados bancários no Clients.
  - **RabbitMQ**: publicação/consumo de eventos de processamento.

## Decisões arquiteturais (resumo)

### Monorepo
Optei por monorepo para manter consistência de tooling (TypeScript/ESLint/Prettier), facilitar execução local e permitir evolução coordenada de contratos, sem impedir deploy independente.

### Clean Architecture (por serviço)
- **Domain**: entidades e regras de negócio (sem dependências externas).
- **Application**: casos de uso (orquestração do fluxo).
- **Infrastructure**: Prisma, repositórios, HTTP clients e mensageria.
- **Presentation**: controllers HTTP e handlers de mensageria.

## Endpoints em produção (EC2)

### Base URLs
- **Clients**: `http://ec2-100-31-156-98.compute-1.amazonaws.com:3000`
- **Transactions**: `http://ec2-100-31-156-98.compute-1.amazonaws.com:3001`

### Swagger (EC2)
- **Clients**: `http://ec2-100-31-156-98.compute-1.amazonaws.com:3000/docs`
- **Transactions**: `http://ec2-100-31-156-98.compute-1.amazonaws.com:3001/docs`

## Swagger / OpenAPI (local)
- **Clients**: `http://localhost:3000/docs`
- **Transactions**: `http://localhost:3001/docs`

## Autenticação (JWT)

O sistema utiliza **JWT Bearer Token**.

### Como obter token
- **Login** (Clients): `POST /api/auth/login`
- Envie `Authorization: Bearer <token>` nos endpoints protegidos.

### `JWT_SECRET` (como configurar)
- O `JWT_SECRET` é o segredo HMAC usado para **assinar** e **validar** JWT.
- O mesmo `JWT_SECRET` deve ser usado por **Clients** e **Transactions**.
- Em produção: configure via variável de ambiente no container/serviço e não faça commit.

Gerar um segredo forte (exemplos):

```bash
openssl rand -base64 32
```

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```
## Contrato de dinheiro (cents) e BigInt

Todas as regras de negócio usam dinheiro internamente como `bigint` (via value object `Amount`) para evitar problemas de precisão/overflow.

- **Entrada (DTO/Controller)**: `number` representando centavos.
- **Domínio (Use Cases/Entities)**: `Amount` (`bigint`).
- **Banco (Postgres/Prisma)**: `BigInt`.
- **Saída (API)**: `string` representando centavos (ex: `"1500"`).
- **Mensageria (RabbitMQ)**: `string` representando centavos, para compatibilidade e serialização.

## Como executar (local)

### Pré-requisitos
- Node.js (v20+)
- Docker + Docker Compose
- pnpm

### Passo a passo
1. Instale dependências:

```bash
pnpm install
```

2. Suba a infraestrutura (Postgres, Redis, RabbitMQ):

```bash
docker compose up -d
```

Alternativas (scripts do projeto):

```bash
pnpm docker:up
```

3. Configure variáveis de ambiente:
- Crie `.env` na raiz (baseado no `env.example`).
- Variáveis mínimas:
  - `JWT_SECRET`
  - `CLIENTS_PORT` (default `3000`)
  - `port` (Transactions, default `3001`)

4. Rode migrations (por serviço):

```bash
pnpm db:clients:migrate:dev
pnpm db:transactions:migrate:dev
```

Alternativa (rodar migrations dos dois serviços):

```bash
pnpm db:migrate:dev
```

5. Rode os serviços:

```bash
pnpm start:dev:clients
pnpm start:dev:transactions
```

Opcional (tudo junto, watch):

```bash
pnpm start:dev
```
## Como testar

### Executar testes
```bash
pnpm test
```

Watch mode:

```bash
pnpm test:watch
```

### Estrutura dos testes
- **Unit (Application / Use Cases)**: `apps/*/test/application/use-cases/*.spec.ts`
- **HTTP (Presentation / Controllers)**: `apps/*/test/presentation/http/*.spec.ts`

## Uso de IA

Ferramentas utilizadas: **Cursor** (editor) e **ChatGPT**.

Uso principal:
- acelerar refatorações com revisão humana (JWT, Amount/BigInt, testes)
- gerar drafts de documentação e checklists de execução
- apoiar na criação de cenários de teste unitário e contratos entre camadas

