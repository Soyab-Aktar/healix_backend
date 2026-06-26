import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IUpdatePatientHealthDataPayload, IUpdatePatientProfilePayload } from "./patient.interface";
import { convertToDateTime } from "./patient.utils";
import { UserStatus } from "../../../generated/prisma/enums";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { patientFilterableFields, patientIncludeConfig, patientSearchableFields } from "./patient.constant";
import { Patient, Prisma } from "../../../generated/prisma/client";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const updateMyProfile = async (user: IRequestUser, payload: IUpdatePatientProfilePayload) => {
  // throw new Error("This is an intentional error to test Sentry integration in the backend.");
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email
    },
    include: {
      patientHealthData: true,
      medicalReports: true,
    }
  });

  await prisma.$transaction(async (tx) => {
    if (payload.patientInfo) {
      await tx.patient.update({
        where: {
          id: patientData.id
        },
        data: {
          ...payload.patientInfo
        }
      });

      if (payload.patientInfo.name || payload.patientInfo.profilePhoto) {
        const userData = {
          name: payload.patientInfo.name ? payload.patientInfo.name : patientData.name,
          image: payload.patientInfo.profilePhoto ? payload.patientInfo.profilePhoto : patientData.profilePhoto,
        }
        await tx.user.update({
          where: {
            id: patientData.userId
          },
          data: {
            ...userData
          }
        });
      };


    }

    if (payload.patientHealthData) {
      const healthDataToSave: IUpdatePatientHealthDataPayload = {
        ...payload.patientHealthData,
      };

      if (payload.patientHealthData.dateOfBirth) {
        healthDataToSave.dateOfBirth = convertToDateTime(
          typeof healthDataToSave.dateOfBirth === "string" ? healthDataToSave.dateOfBirth : undefined
        ) as Date;
      }

      // Remove undefined keys so they don't override default values in create
      Object.keys(healthDataToSave).forEach(key => {
        if (healthDataToSave[key as keyof IUpdatePatientHealthDataPayload] === undefined) {
          delete healthDataToSave[key as keyof IUpdatePatientHealthDataPayload];
        }
      });

      const defaultHealthData = {
        gender: "MALE" as any,
        dateOfBirth: new Date(),
        bloodGroup: "O_POSITIVE" as any,
        height: "0",
        weight: "0",
      };

      await tx.patientHealthData.upsert({
        where: {
          patientId: patientData.id
        },
        update: healthDataToSave,
        create: {
          patientId: patientData.id,
          ...defaultHealthData,
          ...healthDataToSave,
        }
      })
    }

    if (payload.medicalReports && Array.isArray(payload.medicalReports) && payload.medicalReports.length > 0) {
      for (const report of payload.medicalReports) {
        if (report.shouldDelete && report.reportId) {
          const deletedReport = await tx.medicalReport.delete({
            where: {
              id: report.reportId,
            }
          });

          if (deletedReport.reportLink) {
            await deleteFileFromCloudinary(deletedReport.reportLink);
          }
        } else if (report.reportName && report.reportLink) {
          await tx.medicalReport.create({
            data: {
              patientId: patientData.id,
              reportName: report.reportName,
              reportLink: report.reportLink,
            }
          });
        }
      }
    }
  });

  const result = await prisma.patient.findUnique({
    where: {
      id: patientData.id
    },
    include: {
      user: true,
      patientHealthData: true,
      medicalReports: true,
    }
  });

  return result;
};

const getAllPatients = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<Patient, Prisma.PatientWhereInput, Prisma.PatientInclude>(
    prisma.patient,
    {
      sortBy: "createdAt",
      sortOrder: "desc",
      ...query,
    },
    {
      searchableFields: patientSearchableFields,
      filterableFields: patientFilterableFields,
    }
  );

  const result = await queryBuilder
    .search()
    .filter()
    .where({ isDeleted: false })
    .include({
      user: true,
      patientHealthData: true,
      medicalReports: true,
    })
    .dynamicInclude(patientIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getPatientById = async (id: string) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      patientHealthData: true,
      medicalReports: true,
    },
  });

  if (!patient) {
    throw new AppError(status.NOT_FOUND, "Patient not found");
  }

  return patient;
};

const softDeletePatient = async (id: string) => {
  const patient = await prisma.patient.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });

  if (!patient) {
    throw new AppError(status.NOT_FOUND, "Patient not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.patient.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: {
        id: patient.userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: {
        userId: patient.userId,
      },
    });
  });

  return { message: "Patient Deleted Successfully" };
};

export const PatientService = {
  updateMyProfile,
  getAllPatients,
  getPatientById,
  softDeletePatient,
}