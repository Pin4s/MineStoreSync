"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronRight,
  Copy,
  Lock,
  RefreshCw,
  Server,
  Store,
  Webhook
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { getStoredAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

type IntegrationStatus = {
  hasConfig: boolean;
  hasApiToken: boolean;
  rconHost: string | null;
  rconPort: number | null;
  webhookUrl: string | null;
};

type FeedbackMessage = {
  type: "ok" | "error" | "warn";
  text: string;
};

type StatusTone = "success" | "pending" | "error";

function getAuthHeader() {
  const token = getStoredAuthToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function FeedbackLine({ message }: { message: FeedbackMessage | null }) {
  if (!message) return null;

  const colors = {
    ok: "text-[#22c55e]",
    error: "text-[#ef4444]",
    warn: "text-[#eab308]"
  };

  const prefix = {
    ok: "[OK]",
    error: "[ERROR]",
    warn: "[WARN]"
  };

  return (
    <p className={cn("mt-3 font-[family:var(--font-jetbrains-mono)] text-xs", colors[message.type])}>
      {prefix[message.type]} {message.text}
    </p>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-medium uppercase tracking-[0.28em] text-[#86efac]">
      {children}
    </label>
  );
}

function Input({
  icon: Icon,
  disabled,
  type = "text",
  placeholder,
  value,
  onChange
}: {
  icon?: React.ElementType;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative mt-2 flex items-center border border-[rgba(34,197,94,0.4)] bg-[#0a0a0a] transition-all duration-150 focus-within:border-[#22c55e] focus-within:shadow-[0_0_8px_rgba(34,197,94,0.3)]">
      {Icon ? <Icon className="ml-3 h-4 w-4 shrink-0 text-[#6b7280]" /> : null}
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-transparent px-3 py-3 font-[family:var(--font-jetbrains-mono)] text-sm text-[#f0f0f0] placeholder:text-[#6b7280] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

function MaskedField({
  icon: Icon,
  label,
  configured,
  value,
  onChange,
  placeholder
}: {
  icon?: React.ElementType;
  label: string;
  configured: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [replacing, setReplacing] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        {configured && !replacing ? (
          <button
            type="button"
            onClick={() => {
              setReplacing(true);
              onChange("");
            }}
            className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#6b7280] transition-colors hover:text-[#22c55e]"
          >
            &gt; substituir
          </button>
        ) : null}
      </div>

      {configured && !replacing ? (
        <div className="mt-2 flex items-center border border-[rgba(34,197,94,0.2)] bg-[#0a0a0a] px-3 py-3">
          {Icon ? <Icon className="mr-3 h-4 w-4 shrink-0 text-[#6b7280]" /> : null}
          <span className="font-[family:var(--font-jetbrains-mono)] text-sm tracking-widest text-[#6b7280]">
            ••••••••••••
          </span>
        </div>
      ) : (
        <Input
          icon={Icon}
          type="password"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      )}
    </div>
  );
}

function SubmitButton({
  loading,
  children
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative mt-6 h-11 w-full overflow-hidden border border-[#22c55e] bg-[#22c55e] font-[family:var(--font-jetbrains-mono)] text-sm font-semibold text-[#031404] transition-colors duration-150 hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="absolute bottom-0 left-0 h-[2px] w-0 bg-white/40 transition-all duration-300 group-hover:w-full" />
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <RefreshCw className="h-3 w-3 animate-spin" />
          Salvando...
        </span>
      ) : (
        children
      )}
    </button>
  );
}

function GuideLink() {
  return (
    <a
      href="/dashboard/guia"
      className="inline-flex items-center gap-1 font-[family:var(--font-jetbrains-mono)] text-xs text-[#6b7280] transition-colors hover:text-[#22c55e]"
    >
      <ChevronRight className="h-3 w-3" />
      <span>Ajuda</span>
    </a>
  );
}

function StatusBadge({
  tone,
  label
}: {
  tone: StatusTone;
  label: string;
}) {
  const styles = {
    success: "border-[#1a4a1a] bg-[#0f1a0f] text-[#86efac]",
    pending: "border-[#4a3a00] bg-[#110e00] text-[#fde68a]",
    error: "border-[#4a1a1a] bg-[#140808] text-[#fca5a5]"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center border px-2.5 py-1 font-[family:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.22em]",
        styles[tone]
      )}
    >
      {label}
    </span>
  );
}

function ChecklistRow({
  label,
  value,
  tone
}: {
  label: string;
  value: string;
  tone: StatusTone;
}) {
  const dotStyles = {
    success: "bg-[#22c55e]",
    pending: "bg-[#eab308]",
    error: "bg-[#ef4444]"
  };

  return (
    <div className="flex items-center justify-between gap-3 border border-[#111111] bg-[#050505] px-3 py-2.5">
      <div className="flex items-center gap-2">
        <span className={cn("h-2.5 w-2.5 rounded-full", dotStyles[tone])} />
        <span className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#f0f0f0]">
          {label}
        </span>
      </div>
      <span className="font-[family:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.18em] text-[#6b7280]">
        {value}
      </span>
    </div>
  );
}

function CompactActions({
  buttonLabel,
  onButtonClick,
  showGuide = true
}: {
  buttonLabel: string;
  onButtonClick: () => void;
  showGuide?: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={onButtonClick}
        className="h-10 rounded-none border border-[#1a4a1a] bg-[#0a0a0a] px-4 font-[family:var(--font-jetbrains-mono)] text-xs font-semibold text-[#86efac] shadow-none transition-colors duration-75 hover:border-[#22c55e] hover:bg-[#111611] hover:text-[#f0fdf4]"
      >
        {buttonLabel}
      </Button>
      {showGuide ? <GuideLink /> : null}
    </div>
  );
}

function TerminalCard({
  command,
  step,
  title,
  description,
  statusTone,
  statusLabel,
  summary,
  children
}: {
  command: string;
  step: string;
  title: string;
  description: string;
  statusTone: StatusTone;
  statusLabel: string;
  summary: string;
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
          {command} <span className="inline-block animate-[blink_1s_step-end_infinite]">█</span>
        </p>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4 border-b border-[#112411] pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-[0.34em] text-[#6b7280]">{step}</p>
            <div className="space-y-1">
              <h2 className="font-[family:var(--font-share-tech-mono)] text-2xl text-[#f0f0f0]">
                {title}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-[#6b7280]">{description}</p>
            </div>
          </div>

          <div className="space-y-2 lg:text-right">
            <StatusBadge tone={statusTone} label={statusLabel} />
            <p className="max-w-sm text-xs leading-5 text-[#6b7280]">{summary}</p>
          </div>
        </div>

        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}

function StoreCard({
  status,
  onSaved
}: {
  status: IntegrationStatus | null;
  onSaved: () => void;
}) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const completed = Boolean(status?.hasApiToken);
  const statusTone: StatusTone = feedback?.type === "error" ? "error" : completed ? "success" : "pending";
  const statusLabel = statusTone === "error" ? "Erro" : completed ? "Conectado" : "Pendente";
  const summary = completed
    ? "Token da API salvo. A loja já pode enviar dados para o painel."
    : "Salve o token da API da CentralCart para liberar as próximas etapas.";
  const isOpen = !completed || statusTone === "error" || detailsOpen;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token) return;

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ centralCartToken: token })
      });

      if (!response.ok) throw new Error();

      setFeedback({ type: "ok", text: "Token da loja salvo com sucesso." });
      setToken("");
      setDetailsOpen(false);
      onSaved();
    } catch {
      setFeedback({ type: "error", text: "Falha ao salvar. Verifique o token e tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <TerminalCard
      command="> minestoresync --store-config"
      step="Passo 1"
      title="Loja"
      description="Conecte a CentralCart para que o sistema acompanhe vendas e habilite automações."
      statusTone={statusTone}
      statusLabel={statusLabel}
      summary={summary}
    >
      {isOpen ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>Resumo atual</FieldLabel>
              <div className="flex items-center gap-2">
                {completed && detailsOpen ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDetailsOpen(false)}
                    className="h-8 rounded-none border border-[#1a4a1a] bg-[#0a0a0a] px-3 font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac] shadow-none hover:border-[#22c55e] hover:bg-[#111611]"
                  >
                    Fechar
                  </Button>
                ) : null}
                <GuideLink />
              </div>
            </div>

            <ChecklistRow label="Plataforma" value="CentralCart" tone="success" />
            <ChecklistRow
              label="Token da API"
              value={completed ? "Salvo" : "Falta salvar"}
              tone={completed ? "success" : "pending"}
            />
          </div>

          <form onSubmit={handleSubmit} className="panel-surface-soft p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-[#22c55e]" />
                <p className="font-[family:var(--font-share-tech-mono)] text-sm uppercase tracking-[0.24em] text-[#f0f0f0]">
                  Token da API
                </p>
              </div>
              <p className="text-xs leading-5 text-[#6b7280]">
                Salve ou substitua o token da loja para manter a conexão ativa.
              </p>
            </div>

            <div className="mt-4">
              <MaskedField
                icon={Lock}
                label="Token da API"
                configured={completed}
                value={token}
                onChange={setToken}
                placeholder="cc_live_xxxxxxxxxxxxxxxxxxxx"
              />
            </div>

            <FeedbackLine message={feedback} />
            <SubmitButton loading={loading}>Salvar token</SubmitButton>
          </form>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <ChecklistRow label="Plataforma" value="CentralCart" tone="success" />
            <ChecklistRow label="Token da API" value="Salvo" tone="success" />
          </div>
          <CompactActions buttonLabel="Editar token" onButtonClick={() => setDetailsOpen(true)} />
        </div>
      )}
    </TerminalCard>
  );
}

function ServerCard({
  status,
  onSaved
}: {
  status: IntegrationStatus | null;
  onSaved: () => void;
}) {
  const [host, setHost] = useState(status?.rconHost ?? "");
  const [port, setPort] = useState(status?.rconPort?.toString() ?? "25575");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    if (status?.rconHost) setHost(status.rconHost);
    if (status?.rconPort) setPort(status.rconPort.toString());
  }, [status]);

  const completed = Boolean(status?.rconHost && status?.rconPort);
  const statusTone: StatusTone = feedback?.type === "error" ? "error" : completed ? "success" : "pending";
  const statusLabel = statusTone === "error" ? "Erro" : completed ? "Conectado" : "Pendente";
  const summary = completed
    ? `RCON salvo em ${status?.rconHost}:${status?.rconPort}.`
    : "Informe host, porta e senha do RCON para permitir a execução dos comandos.";
  const isOpen = !completed || statusTone === "error" || detailsOpen;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!host || !port || !password) {
      setFeedback({ type: "warn", text: "Preencha host, porta e senha para salvar a conexão." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          rconHost: host,
          rconPort: Number(port),
          rconPassword: password
        })
      });

      if (!response.ok) throw new Error();

      setFeedback({ type: "ok", text: "Configuração RCON salva com sucesso." });
      setPassword("");
      setDetailsOpen(false);
      onSaved();
    } catch {
      setFeedback({
        type: "error",
        text: "Falha ao salvar. Verifique host, porta e senha do RCON."
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <TerminalCard
      command="> minestoresync --rcon-config"
      step="Passo 2"
      title="Servidor Minecraft"
      description="Configure o RCON do servidor para que as automações consigam executar comandos."
      statusTone={statusTone}
      statusLabel={statusLabel}
      summary={summary}
    >
      {isOpen ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>Resumo atual</FieldLabel>
              <div className="flex items-center gap-2">
                {completed && detailsOpen ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDetailsOpen(false)}
                    className="h-8 rounded-none border border-[#1a4a1a] bg-[#0a0a0a] px-3 font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac] shadow-none hover:border-[#22c55e] hover:bg-[#111611]"
                  >
                    Fechar
                  </Button>
                ) : null}
                <GuideLink />
              </div>
            </div>

            <ChecklistRow
              label="Host"
              value={status?.rconHost ?? "Não informado"}
              tone={status?.rconHost ? "success" : "pending"}
            />
            <ChecklistRow
              label="Porta"
              value={status?.rconPort ? String(status.rconPort) : "Não informada"}
              tone={status?.rconPort ? "success" : "pending"}
            />
            <ChecklistRow
              label="Senha RCON"
              value={completed ? "Salva" : "Falta salvar"}
              tone={completed ? "success" : "pending"}
            />
          </div>

          <form onSubmit={handleSubmit} className="panel-surface-soft p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-[#22c55e]" />
                <p className="font-[family:var(--font-share-tech-mono)] text-sm uppercase tracking-[0.24em] text-[#f0f0f0]">
                  Credenciais do servidor
                </p>
              </div>
              <p className="text-xs leading-5 text-[#6b7280]">
                Salve a conexão atual. Não existe teste de conexão disponível nesta tela hoje.
              </p>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <FieldLabel>Host</FieldLabel>
                <Input
                  icon={Server}
                  placeholder="seu-servidor.magnohost.com.br"
                  value={host}
                  onChange={setHost}
                />
              </div>

              <div>
                <FieldLabel>Porta RCON</FieldLabel>
                <Input placeholder="25575" value={port} onChange={setPort} />
              </div>

              <MaskedField
                icon={Lock}
                label="Senha RCON"
                configured={completed}
                value={password}
                onChange={setPassword}
                placeholder="Senha do RCON"
              />
            </div>

            <FeedbackLine message={feedback} />
            <SubmitButton loading={loading}>Salvar servidor</SubmitButton>
          </form>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <ChecklistRow label="Host" value={status?.rconHost ?? "Não informado"} tone="success" />
            <ChecklistRow
              label="Porta"
              value={status?.rconPort ? String(status.rconPort) : "Não informada"}
              tone="success"
            />
            <ChecklistRow label="Senha RCON" value="Salva" tone="success" />
          </div>
          <CompactActions
            buttonLabel="Editar servidor"
            onButtonClick={() => setDetailsOpen(true)}
          />
        </div>
      )}
    </TerminalCard>
  );
}

function WebhookCard({
  status,
  onSaved
}: {
  status: IntegrationStatus | null;
  onSaved: () => void;
}) {
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const [secretSavedInSession, setSecretSavedInSession] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const completed = Boolean(status?.webhookUrl && secretSavedInSession);
  const hasWebhookUrl = Boolean(status?.webhookUrl);
  const statusTone: StatusTone = feedback?.type === "error" ? "error" : completed ? "success" : "pending";
  const statusLabel = statusTone === "error" ? "Erro" : completed ? "Configurado" : "Pendente";
  const summary = completed
    ? "URL disponível e secret salvo nesta sessão."
    : hasWebhookUrl
      ? "A URL já está disponível. Falta salvar o webhook secret para concluir este passo."
      : "Assim que a integração estiver pronta, a URL do webhook aparecerá aqui para cópia.";
  const isOpen = !completed || statusTone === "error" || detailsOpen;

  async function handleCopy() {
    if (!status?.webhookUrl) return;
    await navigator.clipboard.writeText(status.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!secret) return;

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/webhook-secret`, {
        method: "PATCH",
        headers: getAuthHeader(),
        body: JSON.stringify({ webhookSecret: secret })
      });

      if (!response.ok) throw new Error();

      setFeedback({ type: "ok", text: "Webhook secret salvo com sucesso." });
      setSecret("");
      setSecretSavedInSession(true);
      setDetailsOpen(false);
      onSaved();
    } catch {
      setFeedback({ type: "error", text: "Falha ao salvar o secret. Tente novamente." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <TerminalCard
      command="> minestoresync --webhook-config"
      step="Passo 3"
      title="Webhook"
      description="Copie a URL gerada e salve o secret da CentralCart para receber eventos de venda em tempo real."
      statusTone={statusTone}
      statusLabel={statusLabel}
      summary={summary}
    >
      {isOpen ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FieldLabel>Resumo atual</FieldLabel>
              <div className="flex items-center gap-2">
                {completed && detailsOpen ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDetailsOpen(false)}
                    className="h-8 rounded-none border border-[#1a4a1a] bg-[#0a0a0a] px-3 font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac] shadow-none hover:border-[#22c55e] hover:bg-[#111611]"
                  >
                    Fechar
                  </Button>
                ) : null}
                <GuideLink />
              </div>
            </div>

            <ChecklistRow
              label="URL do webhook"
              value={hasWebhookUrl ? "Disponível" : "Aguardando"}
              tone={hasWebhookUrl ? "success" : "pending"}
            />
            <ChecklistRow
              label="Webhook secret"
              value={secretSavedInSession ? "Salvo nesta sessão" : "Falta salvar"}
              tone={secretSavedInSession ? "success" : "pending"}
            />
          </div>

          <div className="space-y-4">
            <section className="panel-surface-soft p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Webhook className="h-4 w-4 text-[#22c55e]" />
                  <p className="font-[family:var(--font-share-tech-mono)] text-sm uppercase tracking-[0.24em] text-[#f0f0f0]">
                    URL do webhook
                  </p>
                </div>
                <p className="text-xs leading-5 text-[#6b7280]">
                  Copie esta URL e cole na CentralCart em Configurações → Webhooks.
                </p>
              </div>

              <div className="mt-4 flex items-center border border-[rgba(34,197,94,0.4)] bg-[#0a0a0a]">
                <span className="flex-1 truncate px-3 py-3 font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">
                  {status?.webhookUrl ?? "A URL será exibida assim que a integração estiver disponível"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void handleCopy()}
                  disabled={!status?.webhookUrl}
                  className="h-auto rounded-none border-0 border-l border-[rgba(34,197,94,0.4)] bg-transparent px-3 py-3 font-[family:var(--font-jetbrains-mono)] text-xs text-[#6b7280] shadow-none hover:bg-[#0f1a0f] hover:text-[#22c55e]"
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copiado" : "Copiar URL"}
                </Button>
              </div>
            </section>

            <form onSubmit={handleSubmit} className="panel-surface-soft p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-[#22c55e]" />
                  <p className="font-[family:var(--font-share-tech-mono)] text-sm uppercase tracking-[0.24em] text-[#f0f0f0]">
                    Webhook secret
                  </p>
                </div>
                <p className="text-xs leading-5 text-[#6b7280]">
                  Depois de criar o webhook na CentralCart, salve aqui o secret gerado por ela.
                </p>
              </div>

              <div className="mt-4">
                <MaskedField
                  icon={Lock}
                  label="Webhook secret"
                  configured={secretSavedInSession}
                  value={secret}
                  onChange={setSecret}
                  placeholder="whsec_xxxxxxxxxxxxxxxxxxxx"
                />
              </div>

              <FeedbackLine message={feedback} />
              <SubmitButton loading={loading}>Salvar secret</SubmitButton>
            </form>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="space-y-3">
            <ChecklistRow label="URL do webhook" value="Disponível" tone="success" />
            <ChecklistRow label="Webhook secret" value="Salvo nesta sessão" tone="success" />
          </div>
          <CompactActions buttonLabel="Ver detalhes" onButtonClick={() => setDetailsOpen(true)} />
        </div>
      )}
    </TerminalCard>
  );
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const storeTokenConfirmedRef = useRef(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/status`, {
        headers: getAuthHeader()
      });

      if (!response.ok) return;

      const data = await response.json();

      storeTokenConfirmedRef.current = storeTokenConfirmedRef.current || Boolean(data.hasApiToken);

      setStatus({
        ...data,
        hasApiToken: Boolean(data.hasApiToken) || storeTokenConfirmedRef.current
      });
    } catch {}
  }, []);

  useEffect(() => {
    void fetchStatus();
  }, [fetchStatus]);

  function handleStoreSaved() {
    storeTokenConfirmedRef.current = true;

    setStatus((current) => {
      if (!current) {
        return {
          hasConfig: false,
          hasApiToken: true,
          rconHost: null,
          rconPort: null,
          webhookUrl: null
        };
      }

      return {
        ...current,
        hasApiToken: true
      };
    });

    void fetchStatus();
  }

  return (
    <div className="space-y-8">
      <div className="border-b border-[#112411] pb-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">system.setup</p>
        <div className="mt-3 space-y-2">
          <h1 className="font-[family:var(--font-share-tech-mono)] text-4xl text-[#f0f0f0]">
            Configuração
          </h1>
          <p className="max-w-2xl text-sm leading-6 text-[#6b7280]">
            Complete os passos abaixo para ativar suas automações.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <StoreCard status={status} onSaved={handleStoreSaved} />
        <ServerCard status={status} onSaved={() => void fetchStatus()} />
        <WebhookCard status={status} onSaved={() => void fetchStatus()} />
      </div>
    </div>
  );
}
