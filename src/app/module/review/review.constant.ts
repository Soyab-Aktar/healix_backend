import { Prisma } from "../../../generated/prisma/client";

export const reviewSearchableFields = [
  "comment",
  "doctor.name",
  "patient.name",
];

export const reviewFilterableFields = [
  "rating",
  "doctorId",
  "patientId",
  "appointmentId",
  "createdAt",
];

export const reviewIncludeConfig: Partial<
  Record<
    keyof Prisma.ReviewInclude,
    Prisma.ReviewInclude[keyof Prisma.ReviewInclude]
  >
> = {
  doctor: true,
  patient: true,
  appointment: true,
};