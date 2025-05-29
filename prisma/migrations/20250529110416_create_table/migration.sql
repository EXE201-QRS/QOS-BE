-- CreateEnum
CREATE TYPE "TableStatus" AS ENUM ('AVAILABLE', 'OCCUPIED', 'CLEANING', 'UNAVAILABLE');

-- CreateTable
CREATE TABLE "Table" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "status" "TableStatus" NOT NULL DEFAULT 'UNAVAILABLE',
    "token" VARCHAR(500) NOT NULL,
    "createdById" INTEGER,
    "updatedById" INTEGER,
    "deletedById" INTEGER,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Table_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Table_token_key" ON "Table"("token");

-- CreateIndex
CREATE INDEX "Table_deletedAt_idx" ON "Table"("deletedAt");

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Table" ADD CONSTRAINT "Table_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
