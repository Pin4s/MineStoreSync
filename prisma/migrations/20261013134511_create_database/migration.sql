-- CreateEnum
CREATE TYPE "CommandStatus" AS ENUM ('PENDING', 'SENT', 'NEEDS_ACTION', 'RESOLVED_MANUALLY');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('RECEIVED', 'PROCESSED', 'FAILED');

-- CreateTable
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" TEXT NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'RECEIVED',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "processed_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "player_id" TEXT NOT NULL,
    "webhook_event_id" TEXT NOT NULL,
    "external_purchase_id" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "purchased_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trigger_commands" (
    "id" TEXT NOT NULL,
    "trigger_key" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "command" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "trigger_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trigger_executions" (
    "id" TEXT NOT NULL,
    "trigger_key" TEXT NOT NULL,
    "player_id" TEXT,
    "purchase_id" TEXT,
    "period_key" TEXT NOT NULL,
    "dedupe_key" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "trigger_executions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "command_executions" (
    "id" TEXT NOT NULL,
    "trigger_execution_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL,
    "command" TEXT NOT NULL,
    "status" "CommandStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_response" TEXT,
    "sent_at" TIMESTAMPTZ(6),
    "resolution_note" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "command_executions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "players_nickname_key" ON "players"("nickname");

-- CreateIndex
CREATE UNIQUE INDEX "webhook_events_external_event_id_key" ON "webhook_events"("external_event_id");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_external_purchase_id_key" ON "purchases"("external_purchase_id");

-- CreateIndex
CREATE UNIQUE INDEX "trigger_commands_trigger_key_sort_order_key" ON "trigger_commands"("trigger_key", "sort_order");

-- CreateIndex
CREATE UNIQUE INDEX "trigger_executions_dedupe_key_key" ON "trigger_executions"("dedupe_key");

-- CreateIndex
CREATE UNIQUE INDEX "command_executions_trigger_execution_id_sort_order_key" ON "command_executions"("trigger_execution_id", "sort_order");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_webhook_event_id_fkey" FOREIGN KEY ("webhook_event_id") REFERENCES "webhook_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trigger_executions" ADD CONSTRAINT "trigger_executions_player_id_fkey" FOREIGN KEY ("player_id") REFERENCES "players"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trigger_executions" ADD CONSTRAINT "trigger_executions_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "command_executions" ADD CONSTRAINT "command_executions_trigger_execution_id_fkey" FOREIGN KEY ("trigger_execution_id") REFERENCES "trigger_executions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
