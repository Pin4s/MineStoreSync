-- CreateTable
CREATE TABLE "goal_cycles" (
    "id" TEXT NOT NULL,
    "target_cents" INTEGER NOT NULL,
    "started_at" TIMESTAMPTZ(6) NOT NULL,
    "reached_at" TIMESTAMPTZ(6),
    "cooldown_until" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "goal_cycles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "goal_cycles_started_at_idx" ON "goal_cycles"("started_at");
