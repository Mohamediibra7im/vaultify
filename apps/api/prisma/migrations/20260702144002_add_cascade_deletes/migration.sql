-- DropForeignKey
ALTER TABLE "Secret" DROP CONSTRAINT "Secret_environmentId_fkey";

-- DropForeignKey
ALTER TABLE "SecretHistory" DROP CONSTRAINT "SecretHistory_secretId_fkey";

-- AddForeignKey
ALTER TABLE "Secret" ADD CONSTRAINT "Secret_environmentId_fkey" FOREIGN KEY ("environmentId") REFERENCES "Environment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SecretHistory" ADD CONSTRAINT "SecretHistory_secretId_fkey" FOREIGN KEY ("secretId") REFERENCES "Secret"("id") ON DELETE CASCADE ON UPDATE CASCADE;
