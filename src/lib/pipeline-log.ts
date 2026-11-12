type PipelineContext = Record<string, string | number | boolean | null>;

const messages: Record<string, string> = {
    "worker.started": "Worker iniciado. Aguardando webhooks",
    "worker.stopped": "Worker parado",
    "worker.poll_failed": "Worker falhou ao buscar ou processar um webhook",
    "webhook.received": "Webhook recebido",
    "webhook.signature_unavailable": "Webhook parado: segredo de assinatura não configurado",
    "webhook.signature_rejected": "Webhook recusado: assinatura inválida",
    "webhook.payload_rejected": "Webhook recusado: dados inválidos",
    "webhook.validated": "Webhook validado",
    "webhook.saved": "Webhook salvo. Aguardando o worker",
    "webhook.duplicate": "Webhook já recebido anteriormente",
    "webhook.save_failed": "Falha ao salvar o webhook",
    "webhook.selected": "Worker começou a processar o webhook",
    "webhook.payload_parsed": "Dados do webhook lidos",
    "webhook.processing_failed": "Falha durante o processamento",
    "webhook.failed_status_saved": "Webhook marcado como falho",
    "webhook.processed": "Pipeline concluída. Webhook marcado como processado",
    "player.resolved": "Jogador encontrado ou criado",
    "purchase.saved": "Compra salva",
    "rules.started": "Regras iniciadas para a compra",
    "rules.purchase_missing": "Compra não encontrada para aplicar as regras",
    "rules.period_resolved": "Período da regra definido",
    "rules.commands_ready": "Regras concluídas. Comandos preparados",
    "rules.completed": "Etapa de regras finalizada",
    "trigger.duplicate_found": "Gatilho já existe para este jogador e período",
    "trigger.saved": "Gatilho criado",
    "commands.templates_loaded": "Modelos de comando encontrados",
    "commands.execution_saved": "Comando colocado na fila",
    "commands.queued": "Fila de comandos pronta"
};

const labels: Record<string, string> = {
    requestId: "requisição",
    webhookEventId: "webhook",
    externalId: "evento externo",
    eventType: "tipo",
    attempt: "tentativa",
    issues: "problemas",
    playerId: "jogador",
    purchaseId: "compra",
    periodKey: "período",
    triggerExecutionId: "gatilho",
    triggerKey: "regra",
    commandExecutionId: "comando",
    sortOrder: "ordem",
    commandCount: "comandos",
    count: "quantidade",
    reason: "motivo"
};

const reasons: Record<string, string> = {
    invalid_headers: "cabeçalhos ausentes ou inválidos",
    mismatch: "assinatura não confere"
};

const warnings = new Set([
    "webhook.signature_unavailable",
    "webhook.signature_rejected",
    "webhook.payload_rejected",
    "webhook.duplicate",
    "webhook.failed_status_saved",
    "rules.purchase_missing",
    "trigger.duplicate_found"
]);

const successes = new Set([
    "webhook.saved",
    "webhook.processed",
    "purchase.saved",
    "trigger.saved",
    "commands.queued"
]);

function formatContext(context: PipelineContext): string {
    return Object.entries(context)
        .map(([key, value]) => {
            const readableValue = key === "reason"
                ? (reasons[String(value)] ?? String(value))
                : String(value);
            return `${labels[key] ?? key}: ${readableValue.replace(/[\r\n\t]/g, " ")}`;
        })
        .join(" | ");
}

function formatLine(step: string, context: PipelineContext, icon: string): string {
    const time = new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
    const details = formatContext(context);
    return `[${time}] ${icon} ${messages[step] ?? step}${details ? ` | ${details}` : ""}`;
}

export function logPipeline(step: string, context: PipelineContext = {}): void {
    const icon = warnings.has(step) ? "⚠️" : successes.has(step) ? "✅" : "➡️";
    const line = formatLine(step, context, icon);
    if (warnings.has(step)) console.warn(line);
    else console.info(line);
}

export function logPipelineError(step: string, error: unknown, context: PipelineContext = {}): void {
    const reason = error instanceof Error ? error.message : String(error);
    console.error(`${formatLine(step, context, "❌")} | erro: ${reason.replace(/[\r\n\t]/g, " ")}`);
    if (error instanceof Error && error.stack) console.error(error.stack);
}
