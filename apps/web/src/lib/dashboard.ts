export type TokenStatus = "valid" | "expired" | "missing";

export type IntegrationStatus = {
  connected: boolean;
  hasConfig?: boolean;
  storeName: string;
  tokenStatus: TokenStatus;
  lastCheckedAt?: string | null;
  rconHost?: string | null;
  rconPort?: number | null;
  webhookUrl?: string | null;
};

export type AutomationType =
  | "SALES_GOAL"
  | "MONTHLY_REVENUE_GOAL"
  | "DAILY_REVENUE_GOAL"
  | "PRODUCT_SALES_GOAL"
  | "FIRST_SALE_OF_DAY"
  | "NEW_BUYER"
  | "HIGH_VALUE_ORDER"
  | "MONTHLY_TOP_BUYER"
  | (string & {});

export type AutomationRecord = {
  id: string;
  name: string;
  conditionType: AutomationType;
  conditionValue: Record<string, unknown> | null;
  command: string;
  active: boolean;
  currentValue?: number | string | null;
  periodStart?: string | null;
  lastTriggeredAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const automationLabels: Record<string, string> = {
  SALES_GOAL: "Meta de vendas",
  MONTHLY_REVENUE_GOAL: "Meta de receita mensal",
  DAILY_REVENUE_GOAL: "Meta de receita diária",
  PRODUCT_SALES_GOAL: "Meta de vendas por produto",
  FIRST_SALE_OF_DAY: "Primeira venda do dia",
  NEW_BUYER: "Novo comprador",
  HIGH_VALUE_ORDER: "Pedido de alto valor",
  MONTHLY_TOP_BUYER: "Maior comprador do mês"
};

const progressAutomationTypes = new Set<AutomationType>([
  "SALES_GOAL",
  "MONTHLY_REVENUE_GOAL",
  "DAILY_REVENUE_GOAL",
  "PRODUCT_SALES_GOAL"
]);

const revenueAutomationTypes = new Set<AutomationType>([
  "MONTHLY_REVENUE_GOAL",
  "DAILY_REVENUE_GOAL",
  "HIGH_VALUE_ORDER"
]);

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const normalized = Number(value.replace(",", "."));
    return Number.isFinite(normalized) ? normalized : null;
  }

  return null;
}

function humanizeToken(token: string) {
  return token
    .toLowerCase()
    .split("_")
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ");
}

export function normalizeIntegrationStatus(payload: Partial<IntegrationStatus> | null | undefined) {
  return {
    connected: Boolean(payload?.connected ?? payload?.hasConfig),
    hasConfig: Boolean(payload?.hasConfig ?? payload?.connected),
    storeName: payload?.storeName ?? "CentralCart",
    tokenStatus: payload?.tokenStatus ?? (payload?.connected ? "valid" : "missing"),
    lastCheckedAt: payload?.lastCheckedAt ?? null,
    rconHost: payload?.rconHost ?? null,
    rconPort: payload?.rconPort ?? null,
    webhookUrl: payload?.webhookUrl ?? null
  } satisfies IntegrationStatus;
}

export function getAutomationDescription(type: AutomationType) {
  return automationLabels[type] ?? humanizeToken(type);
}

export function hasProgress(type: AutomationType) {
  return progressAutomationTypes.has(type);
}

export function getGoalValue(automation: AutomationRecord) {
  if (!automation.conditionValue) {
    return null;
  }

  return toNumber(automation.conditionValue.goal);
}

export function getCurrentValue(automation: AutomationRecord) {
  return toNumber(automation.currentValue ?? null);
}

export function getProgressPercentage(automation: AutomationRecord) {
  const current = getCurrentValue(automation);
  const goal = getGoalValue(automation);

  if (current === null || goal === null || goal <= 0) {
    return null;
  }

  return Math.max(0, Math.min(100, Math.round((current / goal) * 100)));
}

export function formatAutomationValue(type: AutomationType, value: number | null) {
  if (value === null) {
    return "--";
  }

  if (revenueAutomationTypes.has(type)) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      maximumFractionDigits: 2
    }).format(value);
  }

  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 0
  }).format(value);
}

export function formatRelativeDate(input?: string | null) {
  if (!input) {
    return "Aguardando";
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return "Aguardando";
  }

  const diffSeconds = Math.round((date.getTime() - Date.now()) / 1000);
  const absoluteSeconds = Math.abs(diffSeconds);
  const formatter = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

  if (absoluteSeconds < 60) {
    return "agora";
  }

  if (absoluteSeconds < 3600) {
    return formatter.format(Math.round(diffSeconds / 60), "minute");
  }

  if (absoluteSeconds < 86400) {
    return formatter.format(Math.round(diffSeconds / 3600), "hour");
  }

  return formatter.format(Math.round(diffSeconds / 86400), "day");
}

export function formatFriendlyDate(input?: string | null) {
  if (!input) {
    return "Nunca executada";
  }

  const date = new Date(input);

  if (Number.isNaN(date.getTime())) {
    return "Nunca executada";
  }

  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  const time = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);

  if (isToday) {
    return `Hoje, ${time}`;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export function getLatestExecution(automations: AutomationRecord[]) {
  const dates = automations
    .map((automation) => automation.lastTriggeredAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value))
    .filter((value) => !Number.isNaN(value.getTime()))
    .sort((left, right) => right.getTime() - left.getTime());

  return dates[0]?.toISOString() ?? null;
}

export function getGeneralStatus(connected: boolean, activeAutomationsCount: number) {
  if (!connected) {
    return "Integração pendente";
  }

  if (activeAutomationsCount === 0) {
    return "Sem rotinas ativas";
  }

  return "Operacional";
}

export function getTokenStatusLabel(tokenStatus: TokenStatus) {
  if (tokenStatus === "valid") {
    return "Token válido";
  }

  if (tokenStatus === "expired") {
    return "Token expirado";
  }

  return "Token ausente";
}
