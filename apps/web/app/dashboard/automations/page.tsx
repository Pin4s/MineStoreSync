"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Trash2, Zap, ZapOff } from "lucide-react";

import { clearStoredAuthToken, getStoredAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

const API = process.env.NEXT_PUBLIC_API_URL;

function getAuthHeader() {
  const token = getStoredAuthToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

type ConditionType =
  | "SALES_GOAL"
  | "MONTHLY_REVENUE_GOAL"
  | "DAILY_REVENUE_GOAL"
  | "PRODUCT_SALES_GOAL"
  | "HIGH_VALUE_ORDER"
  | "FIRST_SALE_OF_DAY"
  | "NEW_BUYER";

type Automation = {
  id: string;
  name: string;
  conditionType: ConditionType;
  conditionValue: Record<string, unknown>;
  command: string;
  active: boolean;
  currentValue: number | null;
  lastTriggeredAt: string | null;
};

const CONDITIONS: Record<
  ConditionType,
  { label: string; description: string; fields: "goal" | "product" | "minValue" | "none" }
> = {
  SALES_GOAL: {
    label: "Meta de vendas",
    description: "Executa quando o total acumulado de vendas atingir a meta definida.",
    fields: "goal"
  },
  MONTHLY_REVENUE_GOAL: {
    label: "Meta mensal de receita",
    description: "Acompanha as vendas do mês atual. Reinicia automaticamente na virada do mês.",
    fields: "goal"
  },
  DAILY_REVENUE_GOAL: {
    label: "Meta diária de receita",
    description: "Acompanha as vendas do dia atual. Reinicia automaticamente à meia-noite.",
    fields: "goal"
  },
  PRODUCT_SALES_GOAL: {
    label: "Meta por produto",
    description: "Conta quantas vendas aconteceram para um produto específico da CentralCart.",
    fields: "product"
  },
  HIGH_VALUE_ORDER: {
    label: "Compra de alto valor",
    description: "Executa sempre que uma compra ultrapassar o valor mínimo configurado.",
    fields: "minValue"
  },
  FIRST_SALE_OF_DAY: {
    label: "Primeira venda do dia",
    description: "Executa uma única vez na primeira venda aprovada de cada dia.",
    fields: "none"
  },
  NEW_BUYER: {
    label: "Novo comprador",
    description: "Executa quando um jogador faz a primeira compra de todos os tempos na loja.",
    fields: "none"
  }
};

function hasProgress(type: ConditionType): boolean {
  return [
    "SALES_GOAL",
    "MONTHLY_REVENUE_GOAL",
    "DAILY_REVENUE_GOAL",
    "PRODUCT_SALES_GOAL"
  ].includes(type);
}

function getGoal(automation: Automation): number | null {
  const conditionValue = automation.conditionValue;
  if (typeof conditionValue?.goal === "number") return conditionValue.goal;
  return null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "Nunca";
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-medium uppercase tracking-[0.28em] text-[#86efac]">
      {children}
    </label>
  );
}

function TextInput({
  placeholder,
  value,
  onChange,
  type = "text"
}: {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 w-full border border-[rgba(34,197,94,0.4)] bg-[#0a0a0a] px-3 py-2.5 font-[family:var(--font-jetbrains-mono)] text-sm text-[#f0f0f0] placeholder:text-[#6b7280] transition-all focus:border-[#22c55e] focus:shadow-[0_0_8px_rgba(34,197,94,0.3)] focus:outline-none"
    />
  );
}

function FeedbackLine({
  type,
  text
}: {
  type: "ok" | "error" | "warn";
  text: string;
}) {
  const colors = {
    ok: "text-[#22c55e]",
    error: "text-[#ef4444]",
    warn: "text-[#eab308]"
  };
  const prefix = { ok: "[OK]", error: "[ERROR]", warn: "[WARN]" };

  return (
    <p className={cn("mt-3 font-[family:var(--font-jetbrains-mono)] text-xs", colors[type])}>
      {prefix[type]} {text}
    </p>
  );
}

function TerminalCard({
  command,
  children
}: {
  command: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#1a4a1a] bg-[#0a0a0a] shadow-[0_0_20px_rgba(34,197,94,0.06)]">
      <div className="flex items-center justify-between border-b border-[#1a4a1a] bg-[#0f1a0f] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="h-3 w-3 rounded-full bg-[#eab308]" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        </div>
        <p className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">
          {command} <span className="animate-[blink_1s_step-end_infinite]">█</span>
        </p>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function AutomationCard({
  automation,
  onToggle,
  onDelete
}: {
  automation: Automation;
  onToggle: (id: string, active: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const goal = getGoal(automation);
  const current = automation.currentValue ?? 0;
  const progress = goal ? Math.min((current / goal) * 100, 100) : null;
  const meta = CONDITIONS[automation.conditionType];

  return (
    <div
      className={cn(
        "border bg-[#0a0a0a] p-4 transition-colors duration-75",
        automation.active ? "border-[#1a4a1a]" : "border-[#111111] opacity-60"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="truncate font-[family:var(--font-share-tech-mono)] text-sm text-[#f0f0f0]">
            {automation.name}
          </p>
          <p className="text-[10px] uppercase tracking-[0.2em] text-[#86efac]">
            {meta?.label ?? automation.conditionType}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onToggle(automation.id, !automation.active)}
            className={cn(
              "flex h-7 w-7 items-center justify-center border transition-colors duration-75",
              automation.active
                ? "border-[#1a4a1a] text-[#22c55e] hover:border-[#ef4444] hover:text-[#ef4444]"
                : "border-[#374151] text-[#6b7280] hover:border-[#22c55e] hover:text-[#22c55e]"
            )}
            title={automation.active ? "Desativar" : "Ativar"}
          >
            {automation.active ? <Zap className="h-3.5 w-3.5" /> : <ZapOff className="h-3.5 w-3.5" />}
          </button>
          <button
            type="button"
            onClick={() => onDelete(automation.id)}
            className="flex h-7 w-7 items-center justify-center border border-[#3a1616] text-[#fca5a5] transition-colors duration-75 hover:border-[#ef4444] hover:bg-[#150909]"
            title="Deletar"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {hasProgress(automation.conditionType) && goal !== null ? (
        <div className="mt-3 space-y-1">
          <div className="flex justify-between">
            <span className="font-[family:var(--font-jetbrains-mono)] text-[10px] text-[#6b7280]">
              Progresso
            </span>
            <span className="font-[family:var(--font-jetbrains-mono)] text-[10px] text-[#86efac]">
              {current} / {goal}
            </span>
          </div>
          <div className="h-1 w-full bg-[#111111]">
            <div
              className="h-full bg-[#22c55e] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : null}

      <div className="mt-3 border border-[#111111] bg-[#050505] px-3 py-2">
        <p className="truncate font-[family:var(--font-jetbrains-mono)] text-[10px] text-[#6b7280]">
          $ {automation.command}
        </p>
      </div>

      <p className="mt-2 font-[family:var(--font-jetbrains-mono)] text-[10px] text-[#4b5563]">
        Último disparo: {formatDate(automation.lastTriggeredAt)}
      </p>
    </div>
  );
}

function CreateAutomationForm({
  onCreated,
  onCancel
}: {
  onCreated: () => void;
  onCancel?: () => void;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState<ConditionType>("SALES_GOAL");
  const [goal, setGoal] = useState("");
  const [packageId, setPackageId] = useState("");
  const [minValue, setMinValue] = useState("");
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "ok" | "error" | "warn";
    text: string;
  } | null>(null);
  const [typeOpen, setTypeOpen] = useState(false);

  const meta = CONDITIONS[type];

  function buildConditionValue(): Record<string, unknown> {
    if (meta.fields === "goal") return { goal: Number(goal) };
    if (meta.fields === "product") return { packageId: Number(packageId), goal: Number(goal) };
    if (meta.fields === "minValue") return { minValue: Number(minValue) };
    return {};
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!name || !command) {
      setFeedback({ type: "warn", text: "Preencha o nome da automação e o comando." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${API}/automations`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          name,
          conditionType: type,
          conditionValue: buildConditionValue(),
          command
        })
      });

      if (!response.ok) throw new Error();

      setFeedback({ type: "ok", text: "Automação criada com sucesso." });
      setName("");
      setGoal("");
      setPackageId("");
      setMinValue("");
      setCommand("");
      onCreated();
    } catch {
      setFeedback({ type: "error", text: "Falha ao criar. Verifique os dados e tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <TerminalCard command="> minestoresync --new-automation">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-[family:var(--font-share-tech-mono)] text-base uppercase tracking-widest text-[#f0f0f0]">
            Nova automação
          </p>
          <p className="mt-1 text-xs leading-5 text-[#6b7280]">
            Preencha os campos abaixo para criar uma regra nova para a sua loja.
          </p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="text-xs uppercase tracking-[0.18em] text-[#6b7280] transition-colors hover:text-[#86efac]"
          >
            Fechar
          </button>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <FieldLabel>Nome da automação</FieldLabel>
          <TextInput placeholder="Ex: Mensagem da meta do dia" value={name} onChange={setName} />
        </div>

        <div>
          <FieldLabel>Quando deve executar?</FieldLabel>
          <div className="relative mt-2">
            <button
              type="button"
              onClick={() => setTypeOpen((current) => !current)}
              className="flex w-full items-center justify-between border border-[rgba(34,197,94,0.4)] bg-[#0a0a0a] px-3 py-2.5 font-[family:var(--font-jetbrains-mono)] text-sm text-[#f0f0f0] transition-colors hover:border-[#22c55e]"
            >
              {meta.label}
              <ChevronDown
                className={cn("h-4 w-4 text-[#6b7280] transition-transform", typeOpen && "rotate-180")}
              />
            </button>
            {typeOpen ? (
              <div className="absolute z-10 mt-1 w-full border border-[#1a4a1a] bg-[#0a0a0a] shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                {(Object.entries(CONDITIONS) as [ConditionType, typeof CONDITIONS[ConditionType]][]).map(
                  ([key, value]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setType(key);
                        setTypeOpen(false);
                      }}
                      className={cn(
                        "flex w-full flex-col px-3 py-2.5 text-left transition-colors hover:bg-[#0f1a0f]",
                        type === key && "bg-[#0f1a0f]"
                      )}
                    >
                      <span className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#f0f0f0]">
                        {value.label}
                      </span>
                    </button>
                  )
                )}
              </div>
            ) : null}
          </div>
          <p className="mt-1.5 text-[10px] leading-4 text-[#6b7280]">{meta.description}</p>
        </div>

        {meta.fields === "goal" ? (
          <div>
            <FieldLabel>Meta de vendas</FieldLabel>
            <TextInput type="number" placeholder="Ex: 100" value={goal} onChange={setGoal} />
          </div>
        ) : null}

        {meta.fields === "product" ? (
          <>
            <div>
              <FieldLabel>ID do produto (CentralCart)</FieldLabel>
              <TextInput
                type="number"
                placeholder="Ex: 42"
                value={packageId}
                onChange={setPackageId}
              />
              <p className="mt-1 text-[10px] text-[#6b7280]">
                Encontre o ID do produto no painel da CentralCart em Produtos.
              </p>
            </div>
            <div>
              <FieldLabel>Meta de vendas</FieldLabel>
              <TextInput type="number" placeholder="Ex: 50" value={goal} onChange={setGoal} />
            </div>
          </>
        ) : null}

        {meta.fields === "minValue" ? (
          <div>
            <FieldLabel>Valor mínimo do pedido (R$)</FieldLabel>
            <TextInput type="number" placeholder="Ex: 100" value={minValue} onChange={setMinValue} />
          </div>
        ) : null}

        <div>
          <FieldLabel>Comando no servidor</FieldLabel>
          <TextInput
            placeholder="Ex: broadcast Obrigado pela compra, {player}!"
            value={command}
            onChange={setCommand}
          />
          <p className="mt-1.5 text-[10px] leading-4 text-[#6b7280]">
            Use <span className="text-[#86efac]">{"{player}"}</span> para inserir o nick do comprador automaticamente.
          </p>
        </div>

        {feedback ? <FeedbackLine type={feedback.type} text={feedback.text} /> : null}

        <button
          type="submit"
          disabled={loading}
          className="group relative h-11 w-full overflow-hidden border border-[#22c55e] bg-[#22c55e] font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#031404] transition-colors hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/40 transition-all duration-300 group-hover:w-full" />
          {loading ? "Criando..." : "Criar automação"}
        </button>
      </form>
    </TerminalCard>
  );
}

export default function AutomationsPage() {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const mountedRef = useRef(true);
  const router = useRouter();

  const load = useCallback(async () => {
    try {
      const response = await fetch(`${API}/automations`, { headers: getAuthHeader() });
      if (response.status === 401) {
        clearStoredAuthToken();
        router.replace("/login?session=expired");
        return;
      }
      const data = await response.json();
      if (mountedRef.current) setAutomations(data.automations ?? []);
    } catch {
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    mountedRef.current = true;
    void load();
    return () => {
      mountedRef.current = false;
    };
  }, [load]);

  async function handleToggle(id: string, active: boolean) {
    await fetch(`${API}/automations/${id}/toggle`, {
      method: "PATCH",
      headers: getAuthHeader(),
      body: JSON.stringify({ active })
    });
    void load();
  }

  async function handleDelete(id: string) {
    await fetch(`${API}/automations/${id}`, {
      method: "DELETE",
      headers: getAuthHeader()
    });
    void load();
  }

  function handleCreated() {
    setIsCreateOpen(false);
    void load();
  }

  const hasAutomations = automations.length > 0;

  return (
    <div className="space-y-8">
      <div className="border-b border-[#112411] pb-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">
          system.automations
        </p>
        <div className="mt-3 space-y-2">
          <h1 className="font-[family:var(--font-share-tech-mono)] text-4xl text-[#f0f0f0]">
            Automações
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#6b7280]">
            Crie regras para executar comandos no servidor quando algo acontecer na loja.
          </p>
        </div>
      </div>

      {!loading && !hasAutomations ? (
        <div className="space-y-6">
          <section className="panel-surface p-6">
            <div className="space-y-3">
              <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">
                Comece por aqui
              </p>
              <h2 className="font-[family:var(--font-share-tech-mono)] text-3xl text-[#f0f0f0]">
                Nenhuma automação criada ainda
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[#6b7280]">
                Crie sua primeira automação para executar comandos automaticamente quando uma venda acontecer.
              </p>
              <p className="border border-[#1a4a1a] bg-[#050505] px-4 py-3 font-[family:var(--font-jetbrains-mono)] text-xs leading-6 text-[#86efac]">
                Exemplo: Quando as vendas do dia chegarem a R$ 100, envie uma mensagem no servidor.
              </p>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="h-11 border border-[#22c55e] bg-[#22c55e] px-4 font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#031404] transition-colors hover:bg-[#16a34a]"
              >
                + Criar primeira automação
              </button>
            </div>
          </section>

          {isCreateOpen ? <CreateAutomationForm onCreated={handleCreated} /> : null}
        </div>
      ) : null}

      {loading ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_360px]">
          <div className="h-[420px] animate-pulse border border-[#111111] bg-[#070707]" />
          <div className="h-[420px] animate-pulse border border-[#111111] bg-[#070707]" />
        </div>
      ) : null}

      {!loading && hasAutomations ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm leading-6 text-[#6b7280]">
                Use as regras abaixo para decidir quando um comando deve ser executado no servidor.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreateOpen((current) => !current)}
              className="h-11 border border-[#22c55e] bg-[#22c55e] px-4 font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#031404] transition-colors hover:bg-[#16a34a]"
            >
              + Criar automação
            </button>
          </div>

          <div
            className={cn(
              "grid gap-6",
              isCreateOpen
                ? "xl:grid-cols-[minmax(0,1.4fr)_360px]"
                : "xl:grid-cols-[minmax(0,1fr)]"
            )}
          >
            {isCreateOpen ? (
              <CreateAutomationForm
                onCreated={handleCreated}
                onCancel={() => setIsCreateOpen(false)}
              />
            ) : null}

            <TerminalCard command="> minestoresync --list-automations">
              <div className="flex items-center justify-between">
                <p className="font-[family:var(--font-share-tech-mono)] text-sm uppercase tracking-widest text-[#f0f0f0]">
                  Automações criadas
                </p>
                <span className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#6b7280]">
                  {automations.filter((automation) => automation.active).length}/{automations.length} ativas
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {automations.map((automation) => (
                  <AutomationCard
                    key={automation.id}
                    automation={automation}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}

                {automations.length === 0 ? (
                  <div className="border border-dashed border-[#1a4a1a] px-4 py-8 text-center">
                    <p className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#4b5563]">
                      Nenhuma automação ainda.
                    </p>
                    <p className="mt-1 text-[10px] text-[#374151]">
                      Crie a primeira usando o botão acima.
                    </p>
                  </div>
                ) : null}
              </div>
            </TerminalCard>
          </div>
        </div>
      ) : null}
    </div>
  );
}
