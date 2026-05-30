# Novas Automações — SaaS Minecraft + CentralCart

> Este documento descreve as novas automações a serem implementadas além das já existentes (`SALES_GOAL`, `FIRST_SALE_OF_DAY`, `MONTHLY_TOP_BUYER`).

---

## MONTHLY_REVENUE_GOAL

**O que faz:** Dispara quando o servidor atinge uma meta de faturamento dentro do mês corrente. Ao virar o mês, o contador zera e começa a acumular do zero.

**Para que serve:** Dar ao dono do servidor uma celebração mensal atrelada à receita total — útil para marcar milestones de crescimento do servidor ao longo do tempo.

**Como funciona:**
- A cada venda aprovada, o valor do pedido é somado ao acumulado do mês.
- Quando o acumulado ultrapassa a meta configurada, o comando é disparado uma única vez.
- No primeiro dia do mês seguinte, o acumulado volta a zero.

**Exemplo de uso:**
- Meta: R$1.000 no mês
- Comando: `broadcast §6O servidor arrecadou R$1.000 esse mês! Obrigado a todos!`

**Rastreamento:** Progressivo (`currentValue` acumula o faturamento mensal; zera na virada do mês)

---

## DAILY_REVENUE_GOAL

**O que faz:** Igual ao `MONTHLY_REVENUE_GOAL`, mas com janela diária — zera todo dia à meia-noite.

**Para que serve:** Criar metas de curto prazo e incentivar campanhas relâmpago. O dono pode configurar uma promoção de fim de semana e celebrar no servidor quando a meta do dia for batida.

**Como funciona:**
- A cada venda aprovada no dia, o valor é somado ao acumulado diário.
- Quando atinge a meta, dispara o comando uma única vez naquele dia.
- À meia-noite, o acumulado zera independentemente de ter disparado ou não.

**Exemplo de uso:**
- Meta: R$200 em um dia
- Comando: `broadcast §aMeta do dia batida! Parabéns à galera que comprou hoje!`

**Atenção:** Servidores pequenos podem nunca bater a meta diária se ela for calibrada muito alta. O onboarding deve orientar o dono a definir uma meta realista para o tamanho da sua comunidade.

**Rastreamento:** Progressivo (`currentValue` acumula o faturamento do dia corrente; zera à meia-noite)

---

## PRODUCT_SALES_GOAL

**O que faz:** Dispara quando um produto específico da loja atinge uma quantidade de unidades vendidas. Não tem janela temporal — acumula para sempre até atingir a meta.

**Para que serve:** Celebrar marcos de um item específico. O dono pode querer reconhecer quando o servidor vender o 100º VIP Gold, os primeiros 50 kits, etc.

**Como funciona:**
- A cada venda aprovada, o sistema verifica se o produto vendido é o produto configurado na automação.
- Se for, incrementa o contador daquele produto.
- Quando o contador atinge a meta, dispara o comando uma única vez.

**Configuração (`conditionValue`):**
```json
{
  "productId": "vip-gold",
  "goal": 100
}
```

**Exemplo de uso:**
- Meta: 50 VIPs Gold vendidos
- Comando: `broadcast §b50 VIPs Gold vendidos! Que servidor incrível!`

**Rastreamento:** Progressivo (`currentValue` conta unidades vendidas do produto configurado; não zera automaticamente)

---

## NEW_BUYER

**O que faz:** Dispara quando um jogador faz sua **primeira compra de todos os tempos** na loja do servidor. Se o jogador já comprou antes, a automação não dispara.

**Para que serve:** Humanizar a experiência de quem acaba de entrar na comunidade compradora do servidor. Um broadcast de boas-vindas ou um item de presente cria um momento especial para o novo comprador e sinaliza para o servidor que alguém novo chegou.

**Como funciona:**
- A cada venda aprovada, o sistema verifica se o jogador (`buyerName` ou identificador do comprador) já tem algum pedido anterior registrado.
- Se não tiver nenhum pedido anterior, dispara o comando.
- Se já tiver comprado antes, ignora.

**Exemplo de uso:**
- Comando: `broadcast §a» Bem-vindo, {player}! Obrigado pela sua primeira compra no servidor! ❤️`
- Comando alternativo: `give {player} diamond 1` *(presente de boas-vindas)*

**Rastreamento:** Binário (consulta histórico do jogador; sem `currentValue`)

---

## HIGH_VALUE_ORDER

**O que faz:** Dispara toda vez que um pedido único ultrapassa um valor configurado em reais. Não acumula — avalia cada pedido individualmente no momento em que ele é aprovado.

**Para que serve:** Celebrar compras grandes no servidor, gerando um momento de destaque para o comprador e visibilidade para os outros jogadores. O dono decide se quer nomear o jogador no comando ou manter anônimo.

**Como funciona:**
- A cada venda aprovada, o sistema compara o valor do pedido com o valor mínimo configurado.
- Se o valor do pedido for maior ou igual ao mínimo, dispara o comando imediatamente.
- Pode disparar múltiplas vezes — uma para cada pedido que superar o valor.

**Configuração (`conditionValue`):**
```json
{
  "minValue": 100
}
```

**Exemplo de uso:**
- Mínimo: R$100
- Comando: `title @a title {"text":"💎 MEGA COMPRA NO SERVIDOR!","color":"gold"}`
- Comando alternativo com nome: `broadcast §6{player} acabou de fazer uma compra lendária!`

**Rastreamento:** Binário (avalia o valor do pedido atual; sem `currentValue`)1