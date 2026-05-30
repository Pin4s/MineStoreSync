-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ConditionType" ADD VALUE 'MONTHLY_REVENUE_GOAL';
ALTER TYPE "ConditionType" ADD VALUE 'DAILY_REVENUE_GOAL';
ALTER TYPE "ConditionType" ADD VALUE 'PRODUCT_SALES_GOAL';
ALTER TYPE "ConditionType" ADD VALUE 'NEW_BUYER';
ALTER TYPE "ConditionType" ADD VALUE 'HIGH_VALUE_ORDER';

-- CreateTable
CREATE TABLE "KnownBuyer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "clientIdentifier" TEXT NOT NULL,
    "firstPurchaseAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnownBuyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "KnownBuyer_userId_clientIdentifier_key" ON "KnownBuyer"("userId", "clientIdentifier");

-- AddForeignKey
ALTER TABLE "KnownBuyer" ADD CONSTRAINT "KnownBuyer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
