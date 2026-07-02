-- CreateTable
CREATE TABLE "WorkspaceMemberEnvironment" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "environmentId" TEXT NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "WorkspaceMemberEnvironment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMemberEnvironment_memberId_environmentId_key" ON "WorkspaceMemberEnvironment"("memberId", "environmentId");

-- AddForeignKey
ALTER TABLE "WorkspaceMemberEnvironment" ADD CONSTRAINT "WorkspaceMemberEnvironment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "WorkspaceMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMemberEnvironment" ADD CONSTRAINT "WorkspaceMemberEnvironment_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
