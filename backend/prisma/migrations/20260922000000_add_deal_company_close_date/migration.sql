-- AlterTable
ALTER TABLE "deals" ADD COLUMN "company" TEXT;
ALTER TABLE "deals" ADD COLUMN "estimated_close_date" TIMESTAMPTZ(6);
