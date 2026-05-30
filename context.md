markdown# Contexto do Projeto — CentralCart Automation SaaS

## O que é
SaaS para donos de servidor Minecraft que integra a loja CentralCart com o servidor via RCON.
O sistema monitora vendas e dispara comandos no servidor automaticamente baseado em automações configuradas pelo usuário.

## Stack
Node.js, Fastify, PostgreSQL, Prisma, JWT (fastify-jwt), Bcrypt, AES-256-GCM (crypto nativo), rcon-client, BullMQ, Zod

## Arquitetura adotada
route → controller → service → repository → prisma
- **routes**: registra endpoints e aponta pro controller
- **controllers**: valida body com Zod, chama service, responde HTTP
- **services**: regra de negócio, não sabe que existe HTTP
- **repositories**: só fala com o Prisma

Sem factories, sem injeção de dependência complexa. Controller instancia repository e service diretamente.

## Segurança de credenciais
- Senha do usuário: Bcrypt
- Token CentralCart e credenciais RCON: AES-256-GCM (criptografado no banco)
- ENCRYPTION_KEY: só no .env da VPS, nunca no banco
- Frontend nunca recebe credenciais — só booleanos `hasRconConfig: true`
- Não existe endpoint GET de credencial

## Schema Prisma (resumo)
- `User` — id, name, email, passwordHash, createdAt, updatedAt
- `Integration` — userId (unique), rconHost, rconPort, rconPasswordEncrypted, centralCartTokenEncrypted
- `Automation` — userId, name, conditionType (enum: SALES_GOAL, FIRST_SALE_OF_DAY, MONTHLY_TOP_BUYER), conditionValue (Json), command, active, currentValue, periodStart, lastTriggeredAt
- `AutomationLog` — automationId, commandExecuted, success, errorMessage, triggeredAt

## O que já está funcionando
- Criação de usuário (POST /users)
- Login (POST /users/sessions) — retorna JWT

## O que falta implementar (ordem de prioridade)
1. Rota protegida com verifyJWT middleware
2. Salvar integração (token CentralCart + credenciais RCON) criptografados
3. Criar automações
4. Webhook da CentralCart (ou polling se não tiver webhook)
5. Engine que processa evento recebido → busca automações ativas → dispara RCON

## Contexto crítico
Apresentação na segunda-feira para múltiplas turmas de sistemas. Hoje é sexta à noite.
O foco é caminho feliz funcionando — não é hora de refatorar ou testar, é hora de entregar.
O ambiente da apresentação será configurado previamente (não ao vivo).

## Estrutura de pastas atual
src/
├── app.ts
├── server.ts
├── env/index.ts
├── lib/prisma.ts
├── domain/entities/user.ts
├── http/
│   ├── routes/user-routes.ts
│   └── controllers/users/
│       ├── register-controller.ts
│       └── authenticate-controller.ts
├── services/
│   ├── user-service.ts
│   ├── auth-service.ts
│   └── errors/
│       ├── user-already-exists-error.ts
│       └── invalid-credentials-error.ts
└── repositories/
├── user-repository.ts          ← interface
└── prisma/
└── prisma-user-repository.ts

uma feat importante19:22Claude respondeu: Atualização do Estado do SistemaAtualização do Estado do Sistema
29/05/2025 — 18:47
O que está funcionando

POST /users — criação de usuário com senha em bcrypt
POST /users/sessions — autenticação, retorna JWT
GET /users/me — rota protegida, retorna perfil sem passwordHash
POST /integrations — salva credenciais RCON e token CentralCart criptografados com AES-256-GCM
GET /integrations/status — retorna status da configuração sem expor nenhuma credencial

Arquitetura
route → controller → service → repository → prisma
Middleware verifyJWT protegendo rotas autenticadas. Credenciais nunca retornam ao frontend — apenas booleanos e metadados não sensíveis.
O que falta (ordem de prioridade)

Webhook da CentralCart — receber e validar eventos de venda
CRUD de automações — criar, listar, ativar/desativar
Engine — evento recebido → busca automações ativas → dispara RCON
Logs de execução das automações

Contexto
Apresentação segunda-feira para múltiplas turmas. Foco total em caminho feliz funcionando. Testes, refatoração e versionamento de chave ficam pra v2.

Estado do Sistema
29/05/2025 — ~20h

O que está funcionando

POST /users — cria usuário, senha em bcrypt
POST /users/sessions — autentica, retorna JWT
GET /users/me — rota protegida, retorna perfil sem passwordHash
POST /integrations — salva RCON + CentralCart token + webhookSecret, tudo AES-256-GCM, retorna webhookUrl
GET /integrations/status — retorna hasConfig, host, porta e webhookUrl — nunca credenciais
POST /webhooks/:webhookToken — recebe evento da CentralCart, valida HMAC, processa ORDER_APPROVED


Fluxo de credenciais (resumo brutal)
Usuário envia → API criptografa com AES-256-GCM → salva blob no banco. Para usar, API descriptografa em memória, usa, descarta. Front nunca vê os valores — só booleanos e metadados.

Webhook — o que espera e o que faz
Espera:
POST /webhooks/:webhookToken
Headers:
  x-centralcart-signature: hmac-sha256 em hex
  x-centralcart-timestamp: unix timestamp

Body:
{
  "id": "evt_abc123",
  "event": "ORDER_APPROVED",
  "date": "2026-05-29T20:00:00.000Z",
  "data": {
    "total": 500,
    "customer": { "username": "SteveMinecraft" }
  }
}
Faz:

Acha a integration pelo webhookToken
Valida timestamp — rejeita se mais de 5 minutos de diferença
Valida assinatura HMAC com o secret descriptografado
Responde 200 imediatamente
Busca automações ativas do usuário
Para cada SALES_GOAL — soma o valor do pedido ao currentValue, se cruzou o goal executa o comando via RCON e loga

Retorna:
json{ "received": true }

O que falta

CRUD de automações — criar, listar, ativar/desativar
Confirmar campos reais do payload da CentralCart (total, customer.username)
Slides pra apresentação