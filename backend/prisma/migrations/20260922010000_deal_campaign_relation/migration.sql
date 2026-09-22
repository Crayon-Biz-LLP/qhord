-- AlterTable
ALTER TABLE "deals" DROP COLUMN "pipeline";
ALTER TABLE "deals" ADD COLUMN "campaign_id" UUID;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;
