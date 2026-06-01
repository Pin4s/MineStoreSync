"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

import { cn } from "@/lib/utils";

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-3 text-sm leading-7 text-[#9ca3af]">{children}</p>;
}

function Note({
  children,
  type = "info"
}: {
  children: React.ReactNode;
  type?: "info" | "warn" | "tip";
}) {
  const styles = {
    info: {
      border: "border-[#1a4a1a]",
      bg: "bg-[#071107]",
      prefix: "[INFO]",
      color: "text-[#86efac]"
    },
    warn: {
      border: "border-[#4a3a00]",
      bg: "bg-[#110e00]",
      prefix: "[WARN]",
      color: "text-[#eab308]"
    },
    tip: {
      border: "border-[#1a3a4a]",
      bg: "bg-[#070f11]",
      prefix: "[DICA]",
      color: "text-[#67e8f9]"
    }
  };

  const style = styles[type];

  return (
    <div className={cn("mt-4 border px-4 py-3", style.border, style.bg)}>
      <span className={cn("font-[family:var(--font-jetbrains-mono)] text-xs font-bold", style.color)}>
        {style.prefix}{" "}
      </span>
      <span className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#9ca3af]">
        {children}
      </span>
    </div>
  );
}

function Step({
  number,
  title,
  children
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5 flex gap-4">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center border border-[#1a4a1a] bg-[#0f1a0f]">
        <span className="font-[family:var(--font-share-tech-mono)] text-xs text-[#22c55e]">
          {number}
        </span>
      </div>
      <div className="flex-1">
        <p className="font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#f0f0f0]">
          {title}
        </p>
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

type HelpItem = {
  id: string;
  title: string;
  summary: string;
  content: React.ReactNode;
};

type HelpGroup = {
  id: string;
  title: string;
  items: HelpItem[];
};

const groups: HelpGroup[] = [
  {
    id: "primeiros-passos",
    title: "Primeiros passos",
    items: [
      {
        id: "o-que-e",
        title: "O que é o MineStoreSync",
        summary: "Entenda o que a ferramenta conecta e o que ela automatiza.",
        content: (
          <>
            <P>
              O MineStoreSync conecta sua loja da CentralCart ao seu servidor Minecraft.
              Quando uma compra é aprovada, o sistema detecta o evento e pode executar
              automaticamente um comando no servidor.
            </P>
            <P>
              Em vez de acompanhar tudo manualmente, você configura regras e deixa o fluxo
              rodando em segundo plano.
            </P>
            <Note type="tip">
              Você não precisa estar online no servidor para que as automações funcionem.
            </Note>
          </>
        )
      },
      {
        id: "como-funciona",
        title: "Como funciona o fluxo",
        summary: "Veja a ordem correta para deixar tudo funcionando.",
        content: (
          <>
            <Step number={1} title="Conecte a loja">
              Salve o token da API da CentralCart para que o sistema consiga ler as vendas.
            </Step>
            <Step number={2} title="Configure o servidor">
              Informe host, porta e senha do RCON para permitir a execução dos comandos.
            </Step>
            <Step number={3} title="Finalize o webhook">
              Copie a URL gerada, configure na CentralCart e salve o webhook secret.
            </Step>
            <Step number={4} title="Crie automações">
              Depois da configuração, você define as regras que disparam comandos quando algo acontecer na loja.
            </Step>
          </>
        )
      }
    ]
  },
  {
    id: "configuracao",
    title: "Configuração",
    items: [
      {
        id: "conectar-loja",
        title: "Conectar a loja CentralCart",
        summary: "Salve o token da API para liberar a leitura das vendas.",
        content: (
          <>
            <P>O token da API permite que o sistema acesse os dados de vendas da sua loja.</P>
            <Step number={1} title="Acesse o painel da CentralCart">
              Entre em centralcart.com e vá em <Code>Configurações → API</Code>.
            </Step>
            <Step number={2} title="Copie o token">
              Você vai encontrar um token que começa com <Code>cc_live_</Code>.
            </Step>
            <Step number={3} title="Cole no MineStoreSync">
              Vá em <Code>Configuração → Loja</Code> e salve o token.
            </Step>
            <Note type="warn">
              Nunca compartilhe seu token da API. Ele dá acesso de leitura aos dados da sua loja.
            </Note>
          </>
        )
      },
      {
        id: "configurar-rcon",
        title: "Configurar servidor RCON",
        summary: "Ative o RCON e preencha host, porta e senha do servidor.",
        content: (
          <>
            <P>
              O RCON é o protocolo que permite enviar comandos ao servidor remotamente.
            </P>
            <Step number={1} title="Abra o arquivo do servidor">
              Localize o arquivo <Code>server.properties</Code> no painel da sua hospedagem.
            </Step>
            <Step number={2} title="Habilite o RCON">
              Confirme que estas linhas estão assim:
            </Step>
            <div className="mt-3 border border-[#1a4a1a] bg-[#050505] p-4">
              <pre className="font-[family:var(--font-jetbrains-mono)] text-xs leading-6 text-[#86efac]">{`enable-rcon=true\nrcon.port=25575\nrcon.password=SUA_SENHA_FORTE_AQUI`}</pre>
            </div>
            <Step number={3} title="Salve os dados no sistema">
              Em <Code>Configuração → Servidor Minecraft</Code>, preencha host, porta e senha.
            </Step>
            <Note type="warn">
              Use uma senha longa e aleatória para o RCON.
            </Note>
          </>
        )
      },
      {
        id: "configurar-webhook",
        title: "Configurar webhook",
        summary: "Use a URL gerada e salve o secret para receber eventos em tempo real.",
        content: (
          <>
            <P>
              O webhook é o canal que a CentralCart usa para avisar o MineStoreSync quando uma venda acontece.
            </P>
            <Step number={1} title="Copie a URL do webhook">
              Vá em <Code>Configuração → Webhook</Code> e copie a URL gerada.
            </Step>
            <Step number={2} title="Crie o webhook na CentralCart">
              No painel da CentralCart, vá em <Code>Configurações → Webhooks</Code> e cole a URL.
            </Step>
            <Step number={3} title="Salve o secret">
              Depois da criação, copie o secret gerado e salve no campo de webhook do sistema.
            </Step>
            <Note type="info">
              O secret garante que só a CentralCart pode enviar eventos válidos para o seu sistema.
            </Note>
          </>
        )
      }
    ]
  },
  {
    id: "automacoes",
    title: "Automações",
    items: [
      {
        id: "primeira-automacao",
        title: "Criar primeira automação",
        summary: "Escolha quando executar e qual comando o servidor deve rodar.",
        content: (
          <>
            <P>
              Cada automação tem um gatilho e um comando. O gatilho define quando a regra deve rodar.
            </P>
            <Step number={1} title="Dê um nome claro">
              Use nomes simples como <Code>Meta do dia</Code> ou <Code>Boas-vindas para novo comprador</Code>.
            </Step>
            <Step number={2} title="Escolha quando deve executar">
              Você pode usar meta de vendas, primeira venda do dia, compra de alto valor e outros eventos.
            </Step>
            <Step number={3} title="Escreva o comando do servidor">
              O campo aceita comandos do Minecraft sem a barra <Code>/</Code> no início.
            </Step>
          </>
        )
      },
      {
        id: "usar-player",
        title: "Usar variáveis como {player}",
        summary: "Insira automaticamente o nick do comprador no comando.",
        content: (
          <>
            <P>
              Em qualquer comando, use <Code>{"{player}"}</Code> para inserir automaticamente o nick do comprador.
            </P>
            <div className="mt-3 border border-[#1a4a1a] bg-[#050505] p-4">
              <p className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">
                broadcast Bem-vindo, {"{player}"}! Obrigado pela compra!
              </p>
              <p className="mt-2 font-[family:var(--font-jetbrains-mono)] text-xs text-[#4b5563]">
                → broadcast Bem-vindo, SteveMinecraft! Obrigado pela compra!
              </p>
            </div>
            <Note type="tip">
              Para automações de meta total, prefira mensagens gerais, porque nem sempre existe um jogador específico responsável pela meta.
            </Note>
          </>
        )
      },
      {
        id: "exemplos-comandos",
        title: "Exemplos de comandos",
        summary: "Veja ideias prontas para broadcast, recompensas e efeitos.",
        content: (
          <>
            <P>O campo de comando aceita qualquer comando válido do Minecraft, sem a barra inicial.</P>
            <div className="mt-4 space-y-2">
              {[
                {
                  cmd: "broadcast §aMeta atingida! Obrigado a todos!",
                  desc: "Anúncio no chat"
                },
                {
                  cmd: "give {player} diamond 5",
                  desc: "Entrega item ao comprador"
                },
                {
                  cmd: 'title @a title {"text":"META!","color":"gold"}',
                  desc: "Exibe título na tela"
                },
                {
                  cmd: "effect give {player} minecraft:speed 60 2",
                  desc: "Aplica efeito por tempo limitado"
                }
              ].map((item) => (
                <div key={item.cmd} className="border border-[#111111] bg-[#050505] p-3">
                  <p className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">
                    {item.cmd}
                  </p>
                  <p className="mt-1 text-[11px] text-[#6b7280]">{item.desc}</p>
                </div>
              ))}
            </div>
            <Note type="warn">
              Teste os comandos no console do servidor antes de usar em produção.
            </Note>
          </>
        )
      }
    ]
  },
  {
    id: "problemas-comuns",
    title: "Problemas comuns",
    items: [
      {
        id: "token-invalido",
        title: "Token inválido",
        summary: "A loja não conecta ou o sistema não consegue ler as vendas.",
        content: (
          <>
            <P>
              Gere um novo token em <Code>Configurações → API</Code> na CentralCart e atualize em <Code>Configuração → Loja</Code>.
            </P>
            <Note type="warn">
              Confirme se o token começa com <Code>cc_live_</Code> e se foi copiado completo.
            </Note>
          </>
        )
      },
      {
        id: "servidor-nao-conecta",
        title: "Servidor não conecta",
        summary: "O RCON não responde ou os comandos não executam.",
        content: (
          <>
            <P>
              Verifique se o RCON está habilitado, se a porta está correta e se a senha informada no sistema é igual à configurada no servidor.
            </P>
            <Note type="info">
              O host normalmente é o endereço do servidor, como <Code>meu-servidor.magnohost.com.br</Code>.
            </Note>
          </>
        )
      },
      {
        id: "webhook-nao-dispara",
        title: "Webhook não dispara",
        summary: "A venda acontece, mas a automação não roda.",
        content: (
          <>
            <P>
              Confirme se o webhook foi criado na CentralCart com a URL correta e se o webhook secret foi salvo no sistema.
            </P>
            <Note type="warn">
              Sem o secret correto, os eventos são rejeitados por segurança.
            </Note>
          </>
        )
      }
    ]
  }
];

export default function GuiaPage() {
  const [search, setSearch] = useState("");
  const [openItemId, setOpenItemId] = useState<string | null>("o-que-e");

  const filteredGroups = useMemo(() => {
    if (!search.trim()) return groups;

    const term = search.toLowerCase();

    return groups
      .map((group) => ({
        ...group,
        items: group.items.filter(
          (item) =>
            item.title.toLowerCase().includes(term) ||
            item.summary.toLowerCase().includes(term)
        )
      }))
      .filter((group) => group.items.length > 0);
  }, [search]);

  return (
    <div className="space-y-8">
      <div className="border-b border-[#112411] pb-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">system.help</p>
        <div className="mt-3 space-y-2">
          <h1 className="font-[family:var(--font-share-tech-mono)] text-4xl text-[#f0f0f0]">
            Ajuda
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#6b7280]">
            Encontre instruções rápidas para configurar a loja, o servidor e suas automações.
          </p>
        </div>
      </div>

      <section className="panel-surface p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#6b7280]" />
          <input
            type="text"
            placeholder="Buscar assunto..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full border border-[rgba(34,197,94,0.3)] bg-[#0a0a0a] py-3 pl-9 pr-3 font-[family:var(--font-jetbrains-mono)] text-sm text-[#f0f0f0] placeholder:text-[#6b7280] transition-colors focus:border-[#22c55e] focus:outline-none"
          />
        </div>
      </section>

      <div className="grid gap-6">
        {filteredGroups.map((group) => (
          <section key={group.id} className="panel-surface overflow-hidden">
            <div className="border-b border-[#112411] bg-[#0f1a0f] px-4 py-3">
              <h2 className="font-[family:var(--font-share-tech-mono)] text-xl text-[#f0f0f0]">
                {group.title}
              </h2>
            </div>

            <div className="grid gap-3 p-4">
              {group.items.map((item) => {
                const open = openItemId === item.id;

                return (
                  <article key={item.id} className="border border-[#111111] bg-[#050505]">
                    <button
                      type="button"
                      onClick={() => setOpenItemId((current) => (current === item.id ? null : item.id))}
                      className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left transition-colors hover:bg-[#0b120b]"
                    >
                      <div className="min-w-0 space-y-1">
                        <p className="font-[family:var(--font-share-tech-mono)] text-base text-[#f0f0f0]">
                          {item.title}
                        </p>
                        <p className="text-sm leading-6 text-[#6b7280]">{item.summary}</p>
                      </div>
                      <span className="shrink-0 pt-1 text-[#86efac]">
                        {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </span>
                    </button>

                    {open ? (
                      <div className="border-t border-[#112411] px-4 py-4">{item.content}</div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
