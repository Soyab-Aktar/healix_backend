import { Prisma } from "../../../generated/prisma/client";

export const prescriptionSearchableFields = [
  "instructions",
  "doctor.name",
  "patient.name",
];

export const prescriptionFilterableFields = [
  "doctorId",
  "patientId",
  "appointmentId",
  "followUpDate",
  "createdAt",
];

export const prescriptionIncludeConfig: Partial<
  Record<
    keyof Prisma.PrescriptionInclude,
    Prisma.PrescriptionInclude[keyof Prisma.PrescriptionInclude]
  >
> = {
  doctor: true,
  patient: true,
  appointment: true,
};