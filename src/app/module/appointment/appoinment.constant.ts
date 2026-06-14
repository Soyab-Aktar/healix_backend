import { Prisma } from "../../../generated/prisma/client";

export const appointmentSearchableFields = [
  "doctor.name",
  "doctor.email",
  "patient.name",
  "patient.email",
  "status",
  "paymentStatus",
];

export const appointmentFilterableFields = [
  "status",
  "paymentStatus",
  "doctorId",
  "patientId",
  "scheduleId",
  "doctor.name",
  "patient.name",
];

export const appointmentIncludeConfig: Partial<
  Record<keyof Prisma.AppointmentInclude, Prisma.AppointmentInclude[keyof Prisma.AppointmentInclude]>
> = {
  doctor: true,
  patient: true,
  schedule: true,
  payment: true,
};