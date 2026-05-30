/*
  Warnings:

  - A unique constraint covering the columns `[webhookToken]` on the table `Integration` will be added. If there are existing duplicate values, this will fail.
  - The required column `webhookToken` was added to the `Integration` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "Integration" ADD COLUMN     "webhookSecretEncrypted" TEXT,
ADD COLUMN     "webhookToken" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Integration_webhookToken_key" ON "Integration"("webhookToken");
