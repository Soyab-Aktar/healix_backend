import { Prisma } from "../../../generated/prisma/client";

export const patientSearchableFields = ['name', 'email', 'contactNumber'];

export const patientFilterableFields = ['isDeleted', 'createdAt'];

export const patientIncludeConfig: Partial<Record<keyof Prisma.PatientInclude, Prisma.PatientInclude[keyof Prisma.PatientInclude]>> = {
  user: true,
  patientHealthData: true,
  medicalReports: true,
}
