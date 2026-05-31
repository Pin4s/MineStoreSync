"use client";

import { useState, useEffect, useCallback } from "react";
import { Lock, Server, Webhook, Store, Copy, Check, RefreshCw, ChevronRight } from "lucide-react";
import { getStoredAuthToken } from "@/lib/auth";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type FieldState = "idle" | "loading" | "success" | "error";

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getAuthHeader() {
  const token = getStoredAuthToken();
  return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
}

function FeedbackLine({ message }: { message: FeedbackMessage | null }) {
  if (!message) return null;
  const colors = {
    ok: "text-[#22c55e]",
    error: "text-[#ef4444]",
    warn: "text-[#eab308]",
  };
  const prefix = { ok: "[OK]", error: "[ERROR]", warn: "[WARN]" };
  return (
    <p className={cn("mt-3 font-[family:var(--font-jetbrains-mono)] text-xs", colors[message.type])}>
      {prefix[message.type]} {message.text}
    </p>
  );
}

// ─── Terminal Card ─────────────────────────────────────────────────────────────

function TerminalCard({
  command,
  children,
}: {
  command: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-[#1a4a1a] bg-[#0a0a0a] shadow-[0_0_20px_rgba(34,197,94,0.06)]">
      {/* Title bar */}
      <div className="flex items-center justify-between border-b border-[#1a4a1a] bg-[#0f1a0f] px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
          <span className="h-3 w-3 rounded-full bg-[#eab308]" />
          <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
        </div>
        <p className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">
          {command}{" "}
          <span className="animate-[blink_1s_step-end_infinite] inline-block">█</span>
        </p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Field Label ───────────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-medium uppercase tracking-[0.28em] text-[#86efac]">
      {children}
    </label>
  );
}

// ─── Input ─────────────────────────────────────────────────────────────────────

function Input({
  icon: Icon,
  disabled,
  type = "text",
  placeholder,
  value,
  onChange,
}: {
  icon?: React.ElementType;
  disabled?: boolean;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative mt-2 flex items-center border border-[rgba(34,197,94,0.4)] bg-[#0a0a0a] focus-within:border-[#22c55e] focus-within:shadow-[0_0_8px_rgba(34,197,94,0.3)] transition-all duration-150">
      {Icon && (
        <Icon className="ml-3 h-4 w-4 shrink-0 text-[#6b7280] focus-within:text-[#22c55e]" />
      )}
      <input
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent px-3 py-3 font-[family:var(--font-jetbrains-mono)] text-sm text-[#f0f0f0] placeholder:text-[#6b7280] focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}

// ─── Masked Field ──────────────────────────────────────────────────────────────

function MaskedField({
  icon: Icon,
  label,
  configured,
  value,
  onChange,
  placeholder,
}: {
  icon?: React.ElementType;
  label: string;
  configured: boolean;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [replacing, setReplacing] = useState(false);

  const handleReplace = () => {
    setReplacing(true);
    onChange("");
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        {configured && !replacing && (
          <button
            type="button"
            onClick={handleReplace}
            className="font-[family:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-[0.2em] text-[#6b7280] transition-colors hover:text-[#22c55e]"
          >
            &gt; substituir
          </button>
        )}
      </div>
      {configured && !replacing ? (
        <div className="mt-2 flex items-center border border-[rgba(34,197,94,0.2)] bg-[#0a0a0a] px-3 py-3">
          {Icon && <Icon className="mr-3 h-4 w-4 shrink-0 text-[#6b7280]" />}
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

// ─── Submit Button ─────────────────────────────────────────────────────────────

function SubmitButton({
  loading,
  children,
}: {
  loading: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="relative mt-6 h-11 w-full overflow-hidden border border-[#22c55e] bg-[#22c55e] font-[family:var(--font-jetbrains-mono)] text-xs font-bold uppercase tracking-[0.28em] text-[#031404] transition-colors duration-150 hover:bg-[#16a34a] disabled:opacity-60 disabled:cursor-not-allowed group"
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

// ─── Guide Link ────────────────────────────────────────────────────────────────

function GuideLink() {
  return (
    <a
      href="/dashboard/guia"
      className="inline-flex items-center gap-1 font-[family:var(--font-jetbrains-mono)] text-xs text-[#6b7280] transition-colors hover:text-[#22c55e]"
    >
      <ChevronRight className="h-3 w-3" />
      <span>consultar guia de conexão</span>
    </a>
  );
}

// ─── Card: Loja ────────────────────────────────────────────────────────────────

function StoreCard({ status, onSaved }: { status: IntegrationStatus | null; onSaved: () => void }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ centralCartToken: token }),
      });

      if (!res.ok) throw new Error();

      setFeedback({ type: "ok", text: "Token da loja salvo com sucesso." });
      setToken("");
      onSaved();
    } catch {
      setFeedback({ type: "error", text: "Falha ao salvar — verifique o token e tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TerminalCard command="> minestoresync --store-config">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Store className="h-4 w-4 text-[#22c55e]" />
            <p className="font-[family:var(--font-share-tech-mono)] text-base uppercase tracking-widest text-[#f0f0f0]">
              Loja
            </p>
          </div>
          <p className="text-xs leading-5 text-[#6b7280]">
            Conecte sua loja para que o sistema monitore vendas e dispare automações.
          </p>
        </div>
        <GuideLink />
      </div>

      {/* Seletor de loja */}
      <div className="mt-6">
        <FieldLabel>Plataforma</FieldLabel>
        <div className="mt-2 flex gap-2">
          <div className="flex items-center gap-2 border border-[#22c55e] bg-[#0f1a0f] px-4 py-2">
            <span className="h-2 w-2 rounded-full bg-[#22c55e]" />
            <span className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">
              CentralCart
            </span>
          </div>
          <div className="flex items-center gap-2 border border-[#1a4a1a] bg-[#0a0a0a] px-4 py-2 opacity-40">
            <span className="font-[family:var(--font-jetbrains-mono)] text-xs text-[#6b7280]">
              Outras — em breve
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <MaskedField
          icon={Lock}
          label="Token da API"
          configured={status?.hasApiToken ?? false}
          value={token}
          onChange={setToken}
          placeholder="cc_live_xxxxxxxxxxxxxxxxxxxx"
        />
        <FeedbackLine message={feedback} />
        <SubmitButton loading={loading}>$ Salvar Token →</SubmitButton>
      </form>
    </TerminalCard>
  );
}

// ─── Card: Servidor ────────────────────────────────────────────────────────────

function ServerCard({ status, onSaved }: { status: IntegrationStatus | null; onSaved: () => void }) {
  const [host, setHost] = useState(status?.rconHost ?? "");
  const [port, setPort] = useState(status?.rconPort?.toString() ?? "25575");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  useEffect(() => {
    if (status?.rconHost) setHost(status.rconHost);
    if (status?.rconPort) setPort(status.rconPort.toString());
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!host || !port || !password) {
      setFeedback({ type: "warn", text: "Preencha todos os campos." });
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({
          rconHost: host,
          rconPort: Number(port),
          rconPassword: password,
        }),
      });

      if (!res.ok) throw new Error();

      setFeedback({ type: "ok", text: "Configuração RCON salva com sucesso." });
      setPassword("");
      onSaved();
    } catch {
      setFeedback({ type: "error", text: "Falha ao salvar — verifique as credenciais." });
    } finally {
      setLoading(false);
    }
  };

  const alreadyConfigured = status?.hasConfig ?? false;

  return (
    <TerminalCard command="> minestoresync --rcon-config">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[#22c55e]" />
            <p className="font-[family:var(--font-share-tech-mono)] text-base uppercase tracking-widest text-[#f0f0f0]">
              Servidor Minecraft
            </p>
          </div>
          <p className="text-xs leading-5 text-[#6b7280]">
            Configure o acesso RCON para que o sistema execute comandos automaticamente.
          </p>
        </div>
        <GuideLink />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
          <Input
            placeholder="25575"
            value={port}
            onChange={setPort}
          />
        </div>

        <MaskedField
          icon={Lock}
          label="Senha RCON"
          configured={alreadyConfigured}
          value={password}
          onChange={setPassword}
          placeholder="Senha do RCON"
        />

        <FeedbackLine message={feedback} />
        <SubmitButton loading={loading}>$ Salvar Configuração RCON →</SubmitButton>
      </form>
    </TerminalCard>
  );
}

// ─── Card: Webhook ─────────────────────────────────────────────────────────────

function WebhookCard({ status, onSaved }: { status: IntegrationStatus | null; onSaved: () => void }) {
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);

  const handleCopy = async () => {
    if (!status?.webhookUrl) return;
    await navigator.clipboard.writeText(status.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secret) return;

    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations`, {
        method: "POST",
        headers: getAuthHeader(),
        body: JSON.stringify({ webhookSecret: secret }),
      });

      if (!res.ok) throw new Error();

      setFeedback({ type: "ok", text: "Webhook secret salvo com sucesso." });
      setSecret("");
      onSaved();
    } catch {
      setFeedback({ type: "error", text: "Falha ao salvar — tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  const alreadyConfigured = status?.hasConfig ?? false;

  return (
    <TerminalCard command="> minestoresync --webhook-config">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Webhook className="h-4 w-4 text-[#22c55e]" />
            <p className="font-[family:var(--font-share-tech-mono)] text-base uppercase tracking-widest text-[#f0f0f0]">
              Webhook
            </p>
          </div>
          <p className="text-xs leading-5 text-[#6b7280]">
            Configure o webhook para receber notificações de venda em tempo real da CentralCart.
          </p>
        </div>
        <GuideLink />
      </div>

      {/* URL do webhook */}
      <div className="mt-6">
        <FieldLabel>URL do Webhook</FieldLabel>
        <div className="mt-2 flex items-center border border-[rgba(34,197,94,0.4)] bg-[#0a0a0a]">
          <span className="flex-1 truncate px-3 py-3 font-[family:var(--font-jetbrains-mono)] text-xs text-[#86efac]">
            {status?.webhookUrl ?? "Configure a integração para gerar a URL"}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            disabled={!status?.webhookUrl}
            className="flex h-full items-center gap-1 border-l border-[rgba(34,197,94,0.4)] px-3 py-3 font-[family:var(--font-jetbrains-mono)] text-[10px] uppercase tracking-widest text-[#6b7280] transition-colors hover:bg-[#0f1a0f] hover:text-[#22c55e] disabled:opacity-40"
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="mt-1.5 text-[10px] leading-4 text-[#6b7280]">
          Cole essa URL no painel da CentralCart em Configurações → Webhooks.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6">
        <MaskedField
          icon={Lock}
          label="Webhook Secret"
          configured={alreadyConfigured}
          value={secret}
          onChange={setSecret}
          placeholder="whsec_xxxxxxxxxxxxxxxxxxxx"
        />
        <p className="mt-1.5 text-[10px] leading-4 text-[#6b7280]">
          O secret é gerado pela CentralCart ao criar o webhook.
        </p>
        <FeedbackLine message={feedback} />
        <SubmitButton loading={loading}>$ Salvar Webhook Secret →</SubmitButton>
      </form>
    </TerminalCard>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function IntegrationsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/integrations/status`, {
        headers: getAuthHeader(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setStatus(data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-[#112411] pb-6">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#86efac]">
          system.integration
        </p>
        <div className="mt-3 space-y-2">
          <h1 className="font-[family:var(--font-share-tech-mono)] text-4xl text-[#f0f0f0]">
            Integração
          </h1>
          <p className="max-w-xl text-sm leading-6 text-[#6b7280]">
            Conecte sua loja e seu servidor. Preencha cada seção em ordem — loja primeiro, servidor depois, webhook por último.
            Se tiver dúvidas em qualquer etapa,{" "}
            <a
              href="/dashboard/guia"
              className="text-[#86efac] underline-offset-2 hover:underline"
            >
              consulte o guia de conexão
            </a>
            .
          </p>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-6">
        <StoreCard status={status} onSaved={fetchStatus} />
        <ServerCard status={status} onSaved={fetchStatus} />
        <WebhookCard status={status} onSaved={fetchStatus} />
      </div>
    </div>
  );
}
