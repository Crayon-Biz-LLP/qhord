-- AlterTable
ALTER TABLE "deals" ADD COLUMN "pipeline" TEXT NOT NULL DEFAULT 'Pipeline 1';
ALTER TABLE "deals" ADD COLUMN "owner_operator_id" UUID;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_owner_operator_id_fkey" FOREIGN KEY ("owner_operator_id") REFERENCES "operators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
