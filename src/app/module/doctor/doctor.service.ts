import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"
import { IUpdateDoctorPayload } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { IQueryParams } from "../../interfaces/query.interface";
import { doctorFilterableFields, DoctorIncludeConfig, doctorSearchableFields } from "./doctor.constant";
import { Doctor, Prisma } from "../../../generated/prisma/client";

const getAllDoctors = async (query: IQueryParams) => {
  // Fetch all non-deleted doctors
  // const result = await prisma.doctor.findMany({
  //   where: {
  //     isDeleted: false,
  //   },
  //   orderBy: {
  //     createdAt: "desc",
  //   },
  //   select: {
  //     id: true,
  //     name: true,
  //     email: true,
  //     profilePhoto: true,
  //     contactNumber: true,
  //     registrationNumber: true,
  //     experience: true,
  //     gender: true,
  //     appointmentFee: true,
  //     qualification: true,
  //     currentWorkingPlace: true,
  //     designation: true,
  //     averageRating: true,
  //     createdAt: true,
  //     updatedAt: true,
  //     specialties: {
  //       select: {
  //         specialty: {
  //           select: {
  //             id: true,
  //             title: true,
  //           },
  //         },
  //       },
  //     },
  //   },
  // });
  // const doctors = result.map((doctor) => ({
  //   ...doctor,
  //   specialties: doctor.specialties.map((s) => s.specialty),
  // }));
  // return doctors;
  const quaryBuilder = new QueryBuilder<Doctor, Prisma.DoctorWhereInput, Prisma.DoctorInclude>(
    prisma.doctor,
    query,
    {
      searchableFields: doctorSearchableFields,
      filterableFields: doctorFilterableFields,
    }
  )

  const result = await quaryBuilder
    .search()
    .filter()
    .where({ isDeleted: false })
    .include({
      user: true,
      specialties: true,
    })
    .dynamicInclude(DoctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute()

  return result;


};

const getDoctorsById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: id,
      isDeleted: false
    },
    include: {
      specialties: {
        select: {
          specialty: true
        }
      }
    }
  });

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  return {
    ...doctor,
    specialties: doctor.specialties.map((s) => s.specialty),
  }
}

const softDeleteDoctor = async (id: string) => {
  const isDoctorExist = await prisma.doctor.findUnique({
    where: {
      id,
    }
  });

  if (!isDoctorExist) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.doctor.update({
      where: { id },
      data: {
        isDeleted: true,
        deleteAt: new Date(),
      }
    });

    await tx.user.update({
      where: {
        id: isDoctorExist.userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      }
    });

    await tx.session.deleteMany({
      where: {
        userId: isDoctorExist.userId,
      }
    });

    await tx.doctorSpecialty.deleteMany({
      where: {
        doctorId: id,
      }
    })
  })

  return { message: "Doctor Deleted Successfully" };
}

const updateDoctorData = async (id: string, payload: IUpdateDoctorPayload) => {
  const isDoctorExist = await prisma.doctor.findUnique({
    where: {
      id,
    }
  });

  if (!isDoctorExist) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  const { doctor: doctorData, specialties } = payload;

  await prisma.$transaction(async (tx) => {

    // Update Doctor
    if (doctorData) {
      await tx.doctor.update({
        where: { id },
        data: doctorData,
      })
    }

    // Update Specialties
    if (specialties && specialties.length > 0) {
      for (const specialty of specialties) {
        const { specialtyId, shouldDelete } = specialty;
        if (shouldDelete) {
          await tx.doctorSpecialty.delete({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId,
              }
            }
          });
        } else {
          await tx.doctorSpecialty.upsert({
            where: {
              doctorId_specialtyId: {
                doctorId: id,
                specialtyId,
              }
            },
            create: {
              doctorId: id,
              specialtyId,
            },
            update: {}
          })
        }
      }
    }

  });

  const doctor = await getDoctorsById(id);

  return doctor;

}


export const DoctorService = {
  getAllDoctors, getDoctorsById, softDeleteDoctor, updateDoctorData,
}