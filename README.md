# 🏦 Loomi Banking Challenge - Microservices Ecosystem

Este projeto implementa um ecossistema bancário distribuído, focado em escalabilidade, consistência de dados e desacoplamento de serviços.

A solução adota uma abordagem de **Monorepo** utilizando **NestJS Workspaces**, permitindo a gestão unificada de múltiplos microsserviços e bibliotecas compartilhadas sem sacrificar a independência de deploy.

---

## 🏗 Decisões Arquiteturais

### 1. Por que Monorepo?
Embora o sistema seja composto por microsserviços independentes, optamos por utilizar um Monorepo para garantir:
- **Consistência de Contratos:** Tipagem compartilhada (DTOs, Enums) entre serviços, evitando que mudanças em uma ponta quebrem a outra silenciosamente.
- **Padronização:** Configurações de Lint (`ESLint`), Formatação (`Prettier`) e TypeScript (`tsconfig`) unificadas na raiz.
- **Orquestração Simplificada:** Um único `docker-compose.yml` sobe todo o ambiente de desenvolvimento (Bancos, Cache, Broker e APIs).

### 2. Clean Architecture
Cada microsserviço segue rigorosamente os princípios da Clean Architecture para garantir testabilidade e isolamento das regras de negócio:
- **Domain:** Entidades e regras de negócio puras (sem dependências externas).
- **Application:** Casos de uso (Use Cases) que orquestram o fluxo.
- **Infrastructure:** Implementações concretas (Prisma, Repositórios, RabbitMQ).
- **Presentation:** Controllers e Resolvers.

---

## 🛠 Tech Stack

| Categoria | Tecnologia |
| :--- | :--- |
| **Runtime** | Node.js 22 (LTS) |
| **Framework** | NestJS |
| **Linguagem** | TypeScript |
| **Gerenciador** | pnpm |
| **ORM** | Prisma |
| **Validação** | Zod |
| **Banco de Dados** | PostgreSQL |
| **Cache/NoSQL** | Redis |
| **Mensageria** | RabbitMQ |
| **Infra** | Docker Compose |

## 📦 Serviços do Ecossistema

O projeto está dividido em duas aplicações principais dentro da pasta `apps/`:

### 👥 Clients Service (`apps/clients`)
O "Core Banking" do sistema.
- **Responsabilidades:** Gestão de identidade, dados bancários e a "Fonte da Verdade" financeira.
- **Features Chave:**
  - Gerenciamento de saldo via **Ledger** (Partida Dobrada: Credit/Debit).
  - Cache de dados de usuário com **Redis** para alta disponibilidade.
  - Auditoria de alterações cadastrais.

### 💸 Transactions Service (`apps/transactions`)
O motor de processamento financeiro.
- **Responsabilidades:** Orquestração de transferências entre contas.
- **Features Chave:**
  - **Idempotência:** Garante que a mesma transação não seja processada duas vezes (via Redis).
  - **Comunicação Híbrida:** - *Síncrona (HTTP):* Para validação de saldo em tempo real.
    - *Assíncrona (RabbitMQ):* Para efetivação contábil e notificações.

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v20+)
- Docker & Docker Compose
- pnpm (`npm install -g pnpm`)

### Passo a Passo

1. **Instale as dependências:**
   ```bash
   pnpm install
   ```

2. **Suba a infraestrutura (Bancos, Redis e RabbitMQ):**
   ```bash
   docker-compose up -d
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz (baseado no arquivo env.example) para que o Prisma saiba onde conectar.

   Variáveis mínimas:
   - `JWT_SECRET`: segredo usado para assinar e validar JWTs (HMAC). Obrigatório em produção.
   - `CLIENTS_PORT`: porta do serviço de clientes (default: `3000`)
   - `port`: porta do serviço de transações (default: `3001`)

4. **Execute as migrações do banco de dados:**
   Isso criará as tabelas nos bancos `loomi_clients` e `loomi_transactions`.

   ```bash
   # Para o serviço de Clientes
   pnpm prisma migrate dev --schema=apps/clients/prisma/schema.prisma --name init

   # Para o serviço de Transações
   pnpm prisma migrate dev --schema=apps/transactions/prisma/schema.prisma --name init
   ```

5. **Inicie os microsserviços (Modo Dev):**
   ```bash
   pnpm start:dev
   ```

---

## 🔐 Autenticação (API Key)

O sistema utiliza **JWT Bearer Token**.

- Para obter um token: `POST /api/auth/login` (Clients Service)
- Para chamar endpoints protegidos: envie `Authorization: Bearer <token>`

---

## 📚 Swagger / OpenAPI

Após subir os serviços, a documentação Swagger fica disponível em:

- **Clients Service**: `http://localhost:3000/docs`
- **Transactions Service**: `http://localhost:3001/docs`

---

## 🔑 `JWT_SECRET` (como configurar)

O `JWT_SECRET` é o segredo HMAC usado para **assinar** e **validar** tokens JWT.

- Local: coloque no seu `.env` (na raiz do projeto)
- Produção (EC2): configure no ambiente do container/serviço (ex: `docker-compose`, `systemd`, ou export no shell da instância) e **não** commite esse valor no Git.

Regras:
- Use um valor forte (mínimo 32 caracteres, aleatório)
- O mesmo `JWT_SECRET` deve ser usado por **Clients** e **Transactions** (ambos verificam tokens)

