```markdown
# Contexto — Frontend MineStoreSync

## Stack
Next.js (App Router), Tailwind CSS, TypeScript.
Fontes: Share Tech Mono (títulos) e JetBrains Mono (todo o resto).
Carregar via `next/font/google`.

## Design System — leia antes de qualquer coisa
O projeto tem estética Minecraft + terminal + fintech.
Não use border-radius grandes (máximo 4px), fontes sans-serif,
nem cores fora da paleta definida abaixo.

### Paleta
- bg-primary: #050505 (fundo de páginas)
- bg-card: #0a0a0a (cards e inputs)
- bg-card-header: #0f1a0f (barra de título dos cards)
- border-default: #1a4a1a (bordas de containers)
- green-primary: #22c55e (botões, focus, links ativos)
- green-label: #86efac (labels, textos de destaque)
- text-primary: #f0f0f0
- text-muted: #6b7280

### Componentes obrigatórios

**Card:** borda 1px solid #1a4a1a, box-shadow 0 0 20px rgba(34,197,94,0.08),
barra de título com fundo #0f1a0f contendo três círculos (vermelho/amarelo/verde)
+ texto monospace verde + cursor █ piscando.

**Input:** fundo #0a0a0a, borda 1px solid rgba(34,197,94,0.4), ícone à esquerda.
Focus: border #22c55e + box-shadow 0 0 8px rgba(34,197,94,0.4).

**Botão primário:** fundo #22c55e, texto branco uppercase tracking-wider bold,
hover #16a34a, pseudo-elemento ::before com barra de progresso animada no hover.
Prefixo $ ou ▶ antes do texto.

**Botão secundário:** fundo #0a0a0a, borda 2px solid #374151,
hover abrupto (50ms) com fundo #1a4a1a e borda #22c55e.

**Separador:** `──── // ou continue com o email ────`
texto #4b5563, linhas border-t #1f2937.

**Background:** grid blueprint (linear-gradient verde 6% opacity, 32px)
+ partículas de caracteres caindo (§ ▓ ░ ▒ █ $ ₿, opacity 0.08-0.15,
animação translateY de 20s a 40s).

**Terminal fake fixo** (bottom-4 right-4): opacity 0.25,
linhas com prefixo [OK] verde / [WARN] amarelo / [ERROR] vermelho / [INFO] cinza,
scrollam lentamente para cima em loop.

**Animação glitch no h1:**
```css
@keyframes glitch {
  0%, 90%, 100% { text-shadow: none; transform: none; }
  92% { text-shadow: -2px 0 #00ffff, 2px 0 #ff00ff; transform: translateX(-1px); }
  94% { text-shadow: 2px 0 #00ffff, -2px 0 #ff00ff; transform: translateX(1px); }
  96% { text-shadow: none; transform: translateX(-1px); }
}
```

### Tom de escrita (copy)
- Labels: UPPERCASE
- Separadores: // estilo comentário
- Botões: "$ CRIAR CONTA →", "$ ENTRAR"
- Links: "Já tem conta? `> fazer login`"
- Título do card: `> minestoresync --dashboard █`

## Referência visual canônica
As telas de login e cadastro já existem e são a referência absoluta de design.

**Tela de cadastro:**
- Layout split: lado esquerdo com título glitch "CRIAR CONTA", métricas fake
  (LATENCY 24ms / WALLETS 128k / ASSETS $MSS) e BOOTSTRAP.LOG com comandos fake;
  lado direito com card terminal contendo formulário (nome, email, senha,
  confirmar senha) + botões OAuth (GitHub, Google) + separador // + botão
  "$ CRIAR CONTA →"

**Tela de login:**
- Layout split invertido: card terminal à esquerda com formulário
  (email, senha) + link "> RECUPERAR ACESSO" + botão "$ ENTRAR";
  lado direito com título glitch "BEM-VINDO", métricas fake
  (SESSIONS 3.2k / UPTIME 99.9% / NODES Active) e SESSION.LOG

## Telas a construir

### 1. Dashboard / Main
Tela principal pós-login. Deve conter:
- Status de conexão do servidor (conectado/desconectado) com indicador visual
- Nome da loja conectada (CentralCart) e status do token
- Métricas: total de automações cadastradas, automações ativas, última execução
- Lista de automações ativas com progresso quando aplicável:
  - SALES_GOAL, MONTHLY_REVENUE_GOAL, DAILY_REVENUE_GOAL, PRODUCT_SALES_GOAL
    mostram barra de progresso (currentValue / goal em %)
  - FIRST_SALE_OF_DAY, NEW_BUYER, HIGH_VALUE_ORDER mostram apenas status
    (ativo/inativo + última execução)
- Botão para criar nova automação
- Botão/link para tela de configuração

**Endpoint:** GET /integrations/status + GET /automations

### 2. Configuração (RCON + API Key)
Formulário dividido em seções:
- **Seção loja:** seletor de loja (só CentralCart por ora) + campo token da API
- **Seção servidor:** host RCON, porta RCON, senha RCON
- **Seção webhook:** exibe a webhookUrl gerada (readonly, com botão copiar)
  + campo para o webhookSecret da CentralCart
- Cada seção é um card terminal separado
- Campos de senha/token: ao carregar, se já configurado, mostrar placeholder
  "••••••••••••" com botão "SUBSTITUIR" em vez de valor real
  (o backend nunca retorna o valor — só hasConfig: true)

**Endpoint:** POST /integrations + GET /integrations/status

### 3. Criar Automação
Formulário adaptativo — os campos mudam conforme o tipo selecionado:
- Campo "NOME" sempre visível
- Dropdown "TIPO DE CONDIÇÃO" com os 7 tipos disponíveis,
  cada um com descrição curta abaixo ao selecionar
- Campos condicionais por tipo:
  - SALES_GOAL / MONTHLY_REVENUE_GOAL / DAILY_REVENUE_GOAL:
    campo "META (R$)" numérico
  - PRODUCT_SALES_GOAL: campo "ID DO PRODUTO" + campo "META (unidades)"
  - HIGH_VALUE_ORDER: campo "VALOR MÍNIMO (R$)"
  - FIRST_SALE_OF_DAY / NEW_BUYER: sem campos adicionais
- Campo "COMANDO MINECRAFT" com hint sobre {player}
- Botão "$ CRIAR AUTOMAÇÃO →"

**Endpoint:** POST /automations

### 4. Guia de Conexão (INEGOCIÁVEL)
Documentação visual passo a passo. Tom técnico mas claro.
Estrutura sugerida em 3 fases:

**FASE 01 — Conectar a loja**
- Onde encontrar o token na CentralCart (painel > configurações > API)
- Como colar no sistema

**FASE 02 — Conectar o servidor**
- Como habilitar RCON no server.properties
- Onde encontrar host e porta no painel da MAGNOHOST
- Como definir uma senha RCON forte
- Como colar as credenciais no sistema

**FASE 03 — Configurar o webhook**
- Copiar a webhookUrl gerada pelo sistema
- Onde colar na CentralCart (painel > configurações > webhooks)
- Como copiar o webhookSecret gerado e colar no sistema
- Como testar se está funcionando

Usar cards estilo terminal, ícones de step numerados, código inline
para comandos e nomes de campos, alertas estilo [WARN] para pontos
de atenção.

## API — endpoints disponíveis
```

POST /users criar usuário POST /users/sessions login → retorna JWT GET /users/me perfil autenticado
POST /integrations salvar RCON + token + webhookSecret GET /integrations/status retorna hasConfig, host, porta, webhookUrl
POST /automations criar automação GET /automations listar automações do usuário PATCH /automations/:id/toggle ativar/desativar DELETE /automations/:id deletar
POST /webhooks/:webhookToken endpoint público da CentralCart (não usar no front)

```

JWT enviado no header: `Authorization: Bearer <token>`
Armazenar token em cookie httpOnly ou localStorage (decidir na implementação).

## Tipos de automação e seus conditionValue

```typescript
SALES_GOAL:            { goal: number }          // meta acumulada total
MONTHLY_REVENUE_GOAL:  { goal: number }          // meta mensal
DAILY_REVENUE_GOAL:    { goal: number }          // meta diária
PRODUCT_SALES_GOAL:    { packageId: number, goal: number } // unidades de produto
HIGH_VALUE_ORDER:      { minValue: number }       // pedido acima de X
FIRST_SALE_OF_DAY:     {}                        // binário
NEW_BUYER:             {}                        // binário
```

Automações com rastreamento de progresso (têm currentValue):
SALES_GOAL, MONTHLY_REVENUE_GOAL, DAILY_REVENUE_GOAL, PRODUCT_SALES_GOAL

Automações binárias (sem progresso):
FIRST_SALE_OF_DAY, NEW_BUYER, HIGH_VALUE_ORDER

## Observações importantes
- GitHub e Google OAuth nos botões são visuais — não implementados no backend.
  Deixar os botões presentes mas desabilitados ou com tooltip "Em breve".
- O sistema não tem página de perfil ou configurações de conta no MVP.
- Prioridade: Dashboard → Configuração → Criar Automação → Guia de Conexão
```


uma tela de cada vez, pouco a pouco, passo a passo, vamos devagar e com calma
Crie uma tela principal para o usuário após o login, com aparência profissional, organizada e guiadora. A tela deve deixar claro que o usuário já está dentro do sistema, e não deve parecer apenas uma continuação da tela de login ou registro.

A interface precisa ajudar o jogador a se localizar rapidamente dentro do sistema. Ela deve mostrar informações contextuais importantes, como o nome do usuário, o nome do servidor atual, possíveis dados da conta ou personagem, status de conexão e qualquer outra informação relevante para dar sensação de presença e pertencimento.

A tela deve ter uma estrutura mais completa de navegação, preferencialmente com uma sidebar ou painel lateral fixo. Esse painel pode conter atalhos para áreas importantes do sistema, como integrações, sugestões, configurações, guia/tutorial e outras ações principais. A ideia é que o jogador tenha sempre um ponto de referência visual e consiga entender para onde pode ir, o que pode fazer e em que parte do sistema está.

O estilo visual pode manter uma identidade tecnológica, com inspiração em terminal, sistema operacional, painel de controle ou interface futurista. Porém, dentro da área principal do sistema, essa estética deve ser mais refinada e menos “terminal bruto”. A tela precisa parecer mais madura, limpa e bem desenhada, com hierarquia visual clara, bom espaçamento, equilíbrio entre elementos e um acabamento mais profissional.

O layout deve evitar a sensação de que os elementos estão soltos na tela. As informações precisam estar agrupadas de forma lógica, com blocos bem definidos, títulos claros, áreas de ação e uma composição que conduza o olhar do usuário. O objetivo é que a interface seja bonita, mas também funcional, intuitiva e fácil de navegar.

A tela principal deve transmitir a sensação de um hub central do sistema: um lugar onde o usuário entende quem ele é naquele ambiente, em qual servidor está, quais recursos estão disponíveis e quais próximos passos pode tomar. O resultado esperado é uma interface com personalidade, mas também com usabilidade, estrutura e acabamento visual de produto profissional.
