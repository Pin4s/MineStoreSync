# MineStoreSync — UI Style Guide

> Documento de identidade visual do projeto. Qualquer nova tela ou componente
> deve seguir este guia à risca para manter consistência visual.

---

## 1. Conceito e Identidade

O design do MineStoreSync vive na interseção de três universos:

- **Minecraft** — blocos pixelados, caracteres especiais (▓ ░ ▒ █), interações abruptas sem suavidade excessiva, paleta verde característica
- **Terminal de comandos** — tipografia monospace, labels estilo variáveis, separadores como comentários de código (`//`), janelas com barra de título fake, cursores piscando
- **Fintech/Dinheiro** — símbolos monetários ($, ₿, ¥), tom técnico e confiável, precisão visual, nada de decorativo sem propósito

**Referência de tom:** tela inicial do framework [Remix](https://remix.run) — fundo escuro absoluto, brutalismo digital, elegância técnica sem ornamentos.

**Princípio central:** cada elemento deve parecer que foi construído dentro do jogo, mas exibido num terminal profissional.

---

## 2. Cores

Todas as cores devem ser usadas via classe Tailwind ou variável CSS. Nunca usar cores fora deste sistema.

### Paleta base

| Nome | Hex | Uso |
|---|---|---|
| `bg-primary` | `#050505` | Fundo de todas as páginas |
| `bg-card` | `#0a0a0a` | Fundo de cards e inputs |
| `bg-card-header` | `#0f1a0f` | Barra de título dos cards (terminal) |
| `border-default` | `#1a4a1a` | Bordas de cards e containers |
| `border-input` | `#22c55e` a 40% opacity | Borda padrão de inputs |
| `border-focus` | `#22c55e` | Borda de input em focus |

### Paleta verde (cor de marca)

| Nome | Hex | Uso |
|---|---|---|
| `green-primary` | `#22c55e` | Botões principais, bordas em focus, links ativos |
| `green-label` | `#86efac` | Labels de campos, textos de destaque secundário |
| `green-dark` | `#1a4a1a` | Bordas de containers, backgrounds sutis |
| `green-glow` | `#22c55e` a 30% | box-shadow em elementos em foco |

### Textos

| Nome | Hex | Uso |
|---|---|---|
| `text-primary` | `#f0f0f0` | Texto principal |
| `text-muted` | `#6b7280` | Placeholders, textos secundários |
| `text-terminal` | `#86efac` | Texto de elementos estilo terminal |

### Cores de estado (terminal fake, logs)

| Cor | Hex | Uso |
|---|---|---|
| Vermelho | `#ef4444` | `[ERROR]` no terminal fake |
| Amarelo | `#eab308` | `[WARN]` no terminal fake |
| Verde | `#22c55e` | `[OK]` e `[INFO]` no terminal fake |

---

## 3. Tipografia

### Fontes

Carregar via `next/font/google` no `layout.tsx`:

```ts
import { JetBrains_Mono, Share_Tech_Mono } from 'next/font/google'
```

| Fonte | Uso |
|---|---|
| `Share Tech Mono` | Títulos (`h1`, `h2`), barra de título dos cards, elementos de destaque |
| `JetBrains Mono` | Todo o restante — corpo, labels, inputs, botões, parágrafos |

> Nunca usar fontes sans-serif convencionais (Inter, Roboto, Arial). O monospace é parte da identidade.

### Escala tipográfica

| Elemento | Tamanho | Peso | Outras propriedades |
|---|---|---|---|
| `h1` (título de página) | `text-4xl` | `font-bold` | `font-['Share_Tech_Mono']`, com animação glitch |
| Subtítulo de página | `text-base` | `font-normal` | `text-muted`, monospace |
| Labels de campo | `text-xs` | `font-medium` | `uppercase`, `tracking-widest`, `text-[#86efac]` |
| Texto de input | `text-sm` | `font-normal` | monospace, `text-primary` |
| Placeholder | `text-sm` | — | `text-muted` |
| Botão principal | `text-sm` | `font-bold` | `uppercase`, `tracking-wider` |
| Texto de terminal/log | `text-xs` | `font-normal` | `text-terminal`, monospace |

---

## 4. Grid e Background

Toda página usa dois elementos de fundo compostos:

### 4.1 Grid blueprint

```css
background-image:
  linear-gradient(rgba(34, 197, 94, 0.06) 1px, transparent 1px),
  linear-gradient(90deg, rgba(34, 197, 94, 0.06) 1px, transparent 1px);
background-size: 32px 32px;
```

### 4.2 Partículas flutuantes (canvas ou spans)

Caracteres caindo lentamente em loop, opacity baixa (~0.08 a 0.15):
- Caracteres Minecraft: `§ ▓ ░ ▒ █ ▄ ▀`
- Símbolos financeiros: `$ ₿ ¥ € £`
- Velocidade lenta (20s a 40s por ciclo)
- Distribuição aleatória no eixo X
- Implementar com `<canvas>` ou `position: absolute` + `@keyframes` com `translateY`

---

## 5. Componentes

### 5.1 Card / Container principal

```
┌─────────────────────────────────────────────┐
│ ● ● ●                > comando --aqui █      │  ← barra de título
├─────────────────────────────────────────────┤
│                                             │
│           conteúdo do card                 │
│                                             │
└─────────────────────────────────────────────┘
```

- `border-radius: 4px` (máximo — nunca `rounded-xl` ou maiores)
- Borda: `1px solid #1a4a1a`
- `box-shadow: 0 0 20px rgba(34, 197, 94, 0.08)`
- **Barra de título:** fundo `#0f1a0f`, padding `px-4 py-2`, flex entre os círculos e o texto
  - Círculos: `w-3 h-3 rounded-full` nas cores `#ef4444`, `#eab308`, `#22c55e`
  - Texto: monospace, `text-[#86efac]`, `text-xs`, com cursor `█` piscando via animation

### 5.2 Inputs

- Fundo: `#0a0a0a`
- Borda padrão: `1px solid rgba(34, 197, 94, 0.4)`
- `border-radius: 4px`
- Ícone à esquerda: `text-muted` por padrão, muda para `#22c55e` no focus do input pai
- **Focus state:**
  ```css
  border-color: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.4);
  outline: none;
  ```

### 5.3 Botões principais (CTA)

- Fundo: `#22c55e`
- Texto: branco, `uppercase`, `tracking-wider`, monospace, `font-bold`
- `border-radius: 4px`
- Sem gradiente
- Hover: escurece levemente (`#16a34a`)
- Pseudo-elemento `::before` com barra de progresso animada ao hover (efeito de carregamento)
- Ícone de `$` ou bloco (`▶`) antes do texto

### 5.4 Botões secundários / OAuth

Estilo bloco Minecraft:
- Fundo: `#0a0a0a`
- Borda: `2px solid #374151`
- `border-radius: 4px`
- Hover: troca de fundo de forma **abrupta** (`transition-duration: 50ms` ou `steps(1)`)
  - Fundo no hover: `#1a4a1a`
  - Borda no hover: `#22c55e`
- Sem sombra, sem glow — brutalidade pixelada

### 5.5 Separadores

Nunca usar texto simples centralizado. Sempre estilo comentário de código:

```
──────── // ou continue com o email ────────
```

- Texto: `text-[#4b5563]`, monospace, `text-xs`
- Linhas: `border-t border-[#1f2937]`
- Layout: `flex items-center gap-3`

### 5.6 Navbar

- Fundo: `#000000` (preto absoluto, sem transparência)
- `border-bottom: 1px solid #1a4a1a`
- Logo: placeholder quadrado com borda `2px solid #374151`, estilo item do inventário Minecraft
- Nome do app: monospace, `text-[#86efac]`
- Botões: seguem o padrão de botão principal (verde) para CTA e secundário para ações alternativas
- Esconder botões redundantes com `usePathname` — ex: não mostrar "Cadastrar" na página `/cadastrar`

---

## 6. Animações

### 6.1 Glitch no título

```css
@keyframes glitch {
  0%, 90%, 100% { text-shadow: none; transform: none; }
  92% { text-shadow: -2px 0 #00ffff, 2px 0 #ff00ff; transform: translateX(-1px); }
  94% { text-shadow: 2px 0 #00ffff, -2px 0 #ff00ff; transform: translateX(1px); }
  96% { text-shadow: none; transform: translateX(-1px); }
}
```

Aplicar no `h1` com `animation: glitch 4s infinite`.

### 6.2 Cursor piscando (barra de título do card)

```css
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
/* aplicar no span do █ com animation: blink 1s step-end infinite */
```

### 6.3 Partículas / caracteres caindo

```css
@keyframes fall {
  from { transform: translateY(-100vh); opacity: 0; }
  10% { opacity: 0.12; }
  90% { opacity: 0.12; }
  to { transform: translateY(100vh); opacity: 0; }
}
```

Duração: entre `20s` e `40s` (variar por elemento). `animation-timing-function: linear`.

### 6.4 Hover do botão CTA (barra de progresso)

```css
.btn-cta::before {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  height: 2px;
  width: 0%;
  background: rgba(255,255,255,0.5);
  transition: width 0.3s ease;
}
.btn-cta:hover::before { width: 100%; }
```

---

## 7. Terminal fake (log flutuante)

Elemento fixo no canto inferior direito de todas as páginas autenticadas e de auth:

```
[INFO] Conectando ao servidor...
[OK]   Autenticação disponível
[WARN] Sessão expira em 30min
[INFO] MineStoreSync v1.0.0
```

- `position: fixed`, `bottom-4 right-4`
- `opacity: 0.25`, aumenta para `0.5` no hover
- `text-xs`, monospace
- Linhas scrollam lentamente para cima em loop
- Cores por prefixo: `[OK]` verde, `[WARN]` amarelo, `[ERROR]` vermelho, `[INFO]` cinza

---

## 8. Tom de escrita (copy)

| Contexto | Errado | Certo |
|---|---|---|
| Label de campo | "Nome completo" | "NOME COMPLETO" |
| Separador | "Ou continue com email" | `// ou continue com o email` |
| Botão de submit | "Criar conta" | "$ CRIAR CONTA →" |
| Link de redirecionamento | "Clique aqui para login" | "Já tem uma conta? `> fazer login`" |
| Comando na barra do card | — | `> minestoresync --register █` |

---

## 9. Como usar este guia com IA

Sempre inicie o prompt com:

```
Leia docs/ui-guide.md antes de qualquer coisa.
Mantenha 100% de consistência com o design system descrito lá.
O projeto tem estética Minecraft + terminal + fintech.
Não use border-radius grandes, fontes sans-serif, nem cores fora da paleta definida.
```

Em seguida descreva o componente ou tela desejada.

---

*Última atualização: setup inicial — tela de cadastro como referência canônica.*
