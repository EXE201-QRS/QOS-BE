-- CreateTable
CREATE TABLE "Guest" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,
    "tableNumber" INTEGER NOT NULL,
    "refreshToken" VARCHAR(500) NOT NULL,
    "refreshTokenExpiresAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Guest_refreshToken_key" ON "Guest"("refreshToken");

-- CreateIndex
CREATE INDEX "Guest_deletedAt_idx" ON "Guest"("deletedAt");
