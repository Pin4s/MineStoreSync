"use client";

import { useState, useRef } from "react";
import { Search, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Components ───────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-[family:var(--font-share-tech-mono)] text-xl text-[#f0f0f0]">
      {children}
    </h2>
  );
}

function SubTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="mt-6 font-[family:var(--font-jetbrains-mono)] text-xs font-semibold uppercase tracking-[0.24em] text-[#86efac]">
      {children}
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm leading-7 text-[#9ca3af]">{children}</p>;
}

function Note({ children, type = "info" }: { children: React.ReactNode; type?: "info" | "warn" | "tip" }) {
  const styles = {
    info: { border: "border-[#1a4a1a]", bg: "bg-[#071107]", prefix: "[INFO]", color: "text-[#86efac]" },
    warn: { border: "border-[#4a3a00]", bg: "bg-[#110e00]", prefix: "[WARN]", color: "text-[#eab308]" },
    tip:  { border: "border-[#1a3a4a]", bg: "bg-[#070f11]", prefix: "[DICA]", color: "text-[#67e8f9]" },
  };
  const s = styles[type];
  return (
    <div className={cn("mt-4 border px-4 py-3", s.border, s.bg)}>
      <span className={cn("font-[family:var(--font-jetbrains-mono)] text-xs font-bold", s.color)}>{s.prefix} </span>
      <span className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#9ca3af]">{children}</span>
    </div>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <div className="mt-5 flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#1a4a1a] bg-[#0f1a0f]">
        <span className="font-[family:var(--font-share-tech-mono)] text-xs text-[#22c55e]">{number}</span>
      </div>
      <div className="flex-1">
        <p className="font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#f0f0f0]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[#9ca3af]">{children}</p>
      </div>
    </div>
  );
}

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="border border-[#1a4a1a] bg-[#050505] px-1.5 py-0.5 font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">
      {children}
    </code>
  );
}

function AutomationItem({ name, description, hasProgress }: { name: string; description: string; hasProgress?: boolean }) {
  return (
    <div className="mt-3 border border-[#111111] bg-[#050505] p-4">
      <div className="flex items-center gap-2">
        <span className="font-[family:var(--font-jetbrains-mono)] text-xs font-bold text-[#22c55e]">{name}</span>
        {hasProgress && (
          <span className="border border-[#1a4a1a] px-1.5 py-0.5 font-[family:var(--font-jetbrains-mono)] text-[9px] uppercase tracking-widest text-[#86efac]">
            rastreável
          </span>
        )}
      </div>
      <p className="mt-1.5 text-xs leading-5 text-[#9ca3af]">{description}</p>
    </div>
  );
}

// ─── Section data ─────────────────────────────────────────────────────────────

type SectionDef = { id: string; title: string; content: React.ReactNode };

function buildSections(): SectionDef[] {
  return [
    {
      id: "o-que-e",
      title: "O que é o MineStoreSync",
      content: (
        <>
          <P>O MineStoreSync conecta sua loja da CentralCart ao seu servidor Minecraft. Quando alguém compra algo na loja, o sistema detecta a venda e executa automaticamente um comando no servidor — sem que você precise fazer nada.</P>
          <P>Pensa assim: você configura uma regra que diz "quando as vendas do mês baterem R$1.000, faça um anúncio no servidor". A partir daí, o sistema cuida de tudo.</P>
          <Note type="tip">Você não precisa estar online no servidor para que as automações funcionem. Elas rodam em segundo plano, 24 horas por dia.</Note>
        </>
      ),
    },
    {
      id: "conectar-loja",
      title: "Conectar a loja (CentralCart)",
      content: (
        <>
          <P>O token da API permite que o sistema acesse os dados de vendas da sua loja.</P>
          <Step number={1} title="Acesse o painel da CentralCart">Entre em centralcart.com e vá em <Code>Configurações → API</Code>.</Step>
          <Step number={2} title="Copie o token da API">Você vai encontrar um token que começa com <Code>cc_live_</Code>. Copie ele.</Step>
          <Step number={3} title="Cole no MineStoreSync">Vá em <Code>Integração → Loja</Code> e cole o token. Clique em salvar.</Step>
          <Note type="warn">Nunca compartilhe seu token da API. Ele dá acesso de leitura aos dados da sua loja.</Note>
        </>
      ),
    },
    {
      id: "conectar-servidor",
      title: "Conectar o servidor (RCON)",
      content: (
        <>
          <P>O RCON é um protocolo que permite enviar comandos ao servidor remotamente. Você precisa habilitá-lo nas configurações do servidor.</P>
          <Step number={1} title="Acesse o painel da sua hospedagem">Localize o arquivo <Code>server.properties</Code> do seu servidor.</Step>
          <Step number={2} title="Habilite o RCON">Certifique-se que estas linhas estão assim:</Step>
          <div className="mt-3 border border-[#1a4a1a] bg-[#050505] p-4">
            <pre className="font-[family:var(--font-jetbrains-mono)] text-xs leading-6 text-[#86efac]">{`enable-rcon=true\nrcon.port=25575\nrcon.password=SUA_SENHA_FORTE_AQUI`}</pre>
          </div>
          <Step number={3} title="Anote o endereço do servidor">O host é o endereço do servidor, ex: <Code>meu-servidor.magnohost.com.br</Code>. A porta padrão é <Code>25575</Code>.</Step>
          <Step number={4} title="Preencha no MineStoreSync">Vá em <Code>Integração → Servidor Minecraft</Code> e preencha host, porta e senha.</Step>
          <Note type="warn">Use uma senha longa e aleatória para o RCON. Quem tiver essa senha pode executar qualquer comando no servidor.</Note>
        </>
      ),
    },
    {
      id: "configurar-webhook",
      title: "Configurar o Webhook",
      content: (
        <>
          <P>O webhook é o canal que a CentralCart usa para avisar o MineStoreSync quando uma venda acontece. Sem ele, o sistema não sabe que uma compra foi aprovada.</P>
          <Step number={1} title="Copie a URL do webhook">Vá em <Code>Integração → Webhook</Code> e copie a URL gerada. Ela é única para sua conta.</Step>
          <Step number={2} title="Configure na CentralCart">No painel da CentralCart, vá em <Code>Configurações → Webhooks</Code>, crie um novo webhook e cole a URL.</Step>
          <Step number={3} title="Copie o Webhook Secret">A CentralCart vai gerar um secret para o webhook. Copie e cole no campo em <Code>Integração → Webhook</Code> aqui no sistema.</Step>
          <Note type="info">O secret garante que só a CentralCart pode enviar eventos para o seu sistema. Sem ele, os eventos são rejeitados por segurança.</Note>
        </>
      ),
    },
    {
      id: "automacoes",
      title: "Tipos de automação",
      content: (
        <>
          <P>Cada automação tem um tipo que define quando ela dispara.</P>
          <SubTitle>Com rastreamento de progresso</SubTitle>
          <P>Acumulam valores ao longo do tempo. O progresso aparece no dashboard.</P>
          <AutomationItem name="Meta de Vendas" description="Acumula o total de todas as vendas aprovadas, sem limite de período. Dispara uma vez quando atingir a meta." hasProgress />
          <AutomationItem name="Meta Mensal de Receita" description="Igual à Meta de Vendas, mas zera no início de cada mês. Ideal para celebrar o desempenho mensal." hasProgress />
          <AutomationItem name="Meta Diária de Receita" description="Acumula vendas do dia corrente e zera à meia-noite. Bom para campanhas de curto prazo." hasProgress />
          <AutomationItem name="Meta por Produto" description="Conta unidades vendidas de um produto específico. Você precisa informar o ID do produto da CentralCart." hasProgress />
          <SubTitle>Evento direto — sem acumular</SubTitle>
          <AutomationItem name="Primeira Venda do Dia" description="Dispara uma única vez na primeira venda aprovada de cada dia. Reinicia automaticamente à meia-noite." />
          <AutomationItem name="Novo Comprador" description="Dispara quando um jogador faz sua primeira compra de todos os tempos na loja. Perfeito para boas-vindas personalizadas." />
          <AutomationItem name="Compra de Alto Valor" description="Dispara toda vez que um pedido individual supera o valor mínimo configurado. Pode disparar múltiplas vezes." />
          <SubTitle>Usando {"{player}"} nos comandos</SubTitle>
          <P>Em qualquer comando, use <Code>{"{player}"}</Code> e o sistema substitui pelo nick do comprador.</P>
          <div className="mt-3 border border-[#1a4a1a] bg-[#050505] p-4">
            <p className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">broadcast Bem-vindo, {"{player}"}! Obrigado pela compra!</p>
            <p className="mt-2 font-[family:var(--font-jetbrains-mono)] text-xs text-[#4b5563]">→ broadcast Bem-vindo, SteveMinecraft! Obrigado pela compra!</p>
          </div>
          <Note type="tip">Para automações de meta de valor total, prefira comandos de broadcast geral — não há um jogador específico responsável pela meta.</Note>
        </>
      ),
    },
    {
      id: "comandos",
      title: "Comandos Minecraft",
      content: (
        <>
          <P>O campo de comando aceita qualquer comando válido do Minecraft, sem a barra <Code>/</Code>.</P>
          <div className="mt-4 space-y-2">
            {[
              { cmd: "broadcast §aMeta atingida! Obrigado a todos!", desc: "Anúncio no chat (§a = verde)" },
              { cmd: "give {player} diamond 5", desc: "Dá 5 diamantes ao comprador" },
              { cmd: "title @a title {\"text\":\"META!\",\"color\":\"gold\"}", desc: "Título na tela de todos" },
              { cmd: "effect give {player} minecraft:speed 60 2", desc: "Efeito de velocidade ao comprador por 60s" },
              { cmd: "playsound minecraft:ui.toast.challenge_complete master @a", desc: "Som para todos os jogadores" },
            ].map((item, i) => (
              <div key={i} className="border border-[#111111] bg-[#050505] p-3">
                <p className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">{item.cmd}</p>
                <p className="mt-1 text-[11px] text-[#6b7280]">{item.desc}</p>
              </div>
            ))}
          </div>
          <Note type="warn">Teste seus comandos no console do servidor antes de configurar aqui. Um comando com erro não trava o sistema — ele é registrado como falha nos logs.</Note>
        </>
      ),
    },
    {
      id: "problemas",
      title: "Problemas comuns",
      content: (
        <>
          {[
            { p: "A automação não disparou após uma venda", s: "Verifique se o webhook está configurado na CentralCart e se o Webhook Secret está salvo no sistema. Sem o secret, os eventos são rejeitados." },
            { p: "Erro de conexão RCON", s: "Confirme que o RCON está habilitado no server.properties, que a porta está correta e que a senha é idêntica à configurada no servidor." },
            { p: "O comando não executou no servidor", s: "Teste o comando diretamente no console do servidor. Certifique-se de não usar a barra / no início." },
            { p: "Token da API inválido", s: "Gere um novo token em Configurações → API na CentralCart e atualize aqui em Integração → Loja." },
            { p: 'O {player} apareceu literalmente no comando', s: "Isso acontece quando a automação não tem informação de jogador. Use broadcast geral para automações de meta de valor." },
          ].map((item, i) => (
            <div key={i} className="mt-4 border border-[#111111] bg-[#050505] p-4">
              <p className="flex items-start gap-2 font-[family:var(--font-jetbrains-mono)] text-xs font-semibold text-[#f0f0f0]">
                <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-[#22c55e]" />
                {item.p}
              </p>
              <p className="mt-2 text-xs leading-5 text-[#9ca3af]">{item.s}</p>
            </div>
          ))}
        </>
      ),
    },
  ];
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function GuiaPage() {
  const [search, setSearch] = useState("");
  const [activeSection, setActiveSection] = useState("o-que-e");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const sections = buildSections();

  const filtered = search.trim()
    ? sections.filter((s) => s.title.toLowerCase().includes(search.toLowerCase()))
    : sections;

  function scrollTo(id: string) {
    setActiveSection(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-[#112411] pb-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">system.docs</p>
        <div className="mt-3 space-y-2">
          <h1 className="font-[family:var(--font-share-tech-mono)] text-4xl text-[#f0f0f0]">Guia de Conexão</h1>
          <p className="max-w-xl text-sm leading-6 text-[#6b7280]">
            Tudo que você precisa saber para conectar a loja, o servidor e configurar suas automações.
          </p>
        </div>
      </div>

      <div className="grid gap-8 xl:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="space-y-1">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
            <input
              type="text"
              placeholder="Buscar..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[rgba(34,197,94,0.3)] bg-[#0a0a0a] py-2 pl-9 pr-3 font-[family:var(--font-jetbrains-mono)] text-xs text-[#f0f0f0] placeholder:text-[#6b7280] focus:border-[#22c55e] focus:outline-none transition-colors"
            />
          </div>
          {filtered.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollTo(section.id)}
              className={cn(
                "flex w-full items-center px-3 py-2 text-left font-[family:var(--font-jetbrains-mono)] text-xs transition-colors duration-75",
                activeSection === section.id
                  ? "border-l-2 border-[#22c55e] bg-[#0f1a0f] text-[#86efac]"
                  : "border-l-2 border-transparent text-[#6b7280] hover:border-[#1a4a1a] hover:text-[#f0f0f0]"
              )}
            >
              {section.title}
            </button>
          ))}
        </aside>

        <div className="space-y-12">
          {filtered.map((section) => (
            <section
              key={section.id}
              ref={(el) => { sectionRefs.current[section.id] = el; }}
              id={section.id}
              className="scroll-mt-8"
            >
              <div className="border-b border-[#111111] pb-3">
                <SectionTitle>{section.title}</SectionTitle>
              </div>
              <div className="mt-4">{section.content}</div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}