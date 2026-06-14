import { Prisma } from "../../../generated/prisma/client";

export const paymentSearchableFields = [
  "transactionId",
];

export const paymentFilterableFields = [
  "status",
  "appointmentId",
  "amount",
  "createdAt",
];

export const paymentIncludeConfig: Partial<
  Record<
    keyof Prisma.PaymentInclude,
    Prisma.PaymentInclude[keyof Prisma.PaymentInclude]
  >
> = {
  appointment: {
    include: {
      doctor: true,
      patient: true,
      schedule: true,
    },
  },
};