-- AlterTable
ALTER TABLE "User" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Guest_refreshTokenExpiresAt_idx" ON "Guest"("refreshTokenExpiresAt");
