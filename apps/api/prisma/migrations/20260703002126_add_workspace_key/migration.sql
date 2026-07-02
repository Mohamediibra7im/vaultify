-- AlterTable
ALTER TABLE "Secret" ADD COLUMN     "workspaceKeyId" TEXT;

-- AlterTable
ALTER TABLE "SecretHistory" ADD COLUMN     "workspaceKeyId" TEXT;

-- CreateTable
CREATE TABLE "WorkspaceKey" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "keyEncryptedWithMaster" TEXT NOT NULL,
    "keyIv" TEXT NOT NULL,
    "keyTag" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkspaceKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceKey_workspaceId_key" ON "WorkspaceKey"("workspaceId");
