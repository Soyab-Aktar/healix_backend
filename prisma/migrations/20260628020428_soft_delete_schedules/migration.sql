-- DropForeignKey
ALTER TABLE "appointments" DROP CONSTRAINT "appointments_scheduleId_fkey";

-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "appointmentDate" TIMESTAMP(3),
ADD COLUMN     "appointmentEnd" TIMESTAMP(3),
ADD COLUMN     "appointmentStart" TIMESTAMP(3),
ALTER COLUMN "scheduleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "schedules" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "schedules_isActive_idx" ON "schedules"("isActive");

-- CreateIndex
CREATE INDEX "schedules_endDateTime_idx" ON "schedules"("endDateTime");

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;
