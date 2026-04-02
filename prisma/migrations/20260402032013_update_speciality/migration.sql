/*
  Warnings:

  - You are about to drop the `doctor_spp` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "doctor_spp" DROP CONSTRAINT "doctor_spp_doctorId_fkey";

-- DropForeignKey
ALTER TABLE "doctor_spp" DROP CONSTRAINT "doctor_spp_specialtyId_fkey";

-- DropTable
DROP TABLE "doctor_spp";

-- CreateTable
CREATE TABLE "doctor_specialty" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "specialtyId" TEXT NOT NULL,

    CONSTRAINT "doctor_specialty_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_doctor_specialty_doctorId" ON "doctor_specialty"("doctorId");

-- CreateIndex
CREATE INDEX "idx_doctor_specialty_specialtyId" ON "doctor_specialty"("specialtyId");

-- CreateIndex
CREATE UNIQUE INDEX "doctor_specialty_doctorId_specialtyId_key" ON "doctor_specialty"("doctorId", "specialtyId");

-- AddForeignKey
ALTER TABLE "doctor_specialty" ADD CONSTRAINT "doctor_specialty_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "doctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doctor_specialty" ADD CONSTRAINT "doctor_specialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES "specialites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
