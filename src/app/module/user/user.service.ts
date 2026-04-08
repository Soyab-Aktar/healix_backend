import status from "http-status";
import { Role, Specialty } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateAdminPayload, ICreateDoctorPayload, ICreateSuperAdminPayload } from "./user.interface";

const createDoctor = async (payload: ICreateDoctorPayload) => {

  //* Check Specialty validation
  const specialties: Specialty[] = [];
  for (const specialtyId of payload.specialties) {
    const specialty = await prisma.specialty.findUnique({
      where: {
        id: specialtyId
      }
    })
    if (!specialty) {
      throw new AppError(status.NOT_FOUND, `Specialty with id ${specialtyId} not found`);
    }
    specialties.push(specialty);
  }

  //* Check User Exist or not
  const userExist = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    }
  })
  if (userExist) {
    throw new AppError(status.CONFLICT, "User already exist");
  }

  //* Create User
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      name: payload.doctor.name,
      needPasswordChange: true,

    }
  })
  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        }
      })

      const doctorSpecialityData = specialties.map((specialty) => {
        return {
          doctorId: doctorData.id,
          specialtyId: specialty.id,
        }
      })

      await tx.doctorSpecialty.createMany({
        data: doctorSpecialityData
      })

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id
        },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          address: true,
          registrationNumber: true,
          experience: true,
          gender: true,
          currentWorkingPlace: true,
          designation: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              emailVerified: true,
              createdAt: true,
              updatedAt: true,
              isDeleted: true,
              deletedAt: true
            }
          },
          specialties: {
            select: {
              specialty: {
                select: {
                  title: true,
                  id: true,
                }
              }
            }
          }
        }


      })

      return doctor;
    })

    return result;

  } catch (err) {
    console.log("Transaction Error : ", err);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      }
    })
    throw err;
  }


}
const createAdmin = async (payload: ICreateAdminPayload) => {

  //* Check User Exist or not
  const userExist = await prisma.user.findUnique({
    where: {
      email: payload.admin.email,
    }
  })
  if (userExist) {
    throw new AppError(status.CONFLICT, "User already exist");
  }

  //* Create User
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.admin.email,
      password: payload.password,
      role: Role.ADMIN,
      name: payload.admin.name,
      needPasswordChange: true,

    }
  })
  try {
    const result = await prisma.$transaction(async (tx) => {
      const adminData = await tx.admin.create({
        data: {
          userId: userData.user.id,
          ...payload.admin,
        }
      })

      const admin = await tx.admin.findUnique({
        where: {
          id: adminData.id
        },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              emailVerified: true,
              createdAt: true,
              updatedAt: true,
              isDeleted: true,
              deletedAt: true
            }
          }
        }


      })

      return admin;
    })

    return result;

  } catch (err) {
    console.log("Transaction Error : ", err);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      }
    })
    throw new AppError(status.BAD_REQUEST, "Admin creation failed");
  }


}
const createSuperAdmin = async (payload: ICreateSuperAdminPayload) => {

  //* Check User Exist or not
  const userExist = await prisma.user.findUnique({
    where: {
      email: payload.superAdmin.email,
    }
  })
  if (userExist) {
    throw new AppError(status.CONFLICT, "User already exist");
  }

  //* Create User
  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.superAdmin.email,
      password: payload.password,
      role: Role.SUPER_ADMIN,
      name: payload.superAdmin.name,
      needPasswordChange: true,

    }
  })
  try {
    const result = await prisma.$transaction(async (tx) => {
      const superAdminData = await tx.superAdmin.create({
        data: {
          userId: userData.user.id,
          ...payload.superAdmin,
        }
      })

      const superAdmin = await tx.superAdmin.findUnique({
        where: {
          id: superAdminData.id
        },
        select: {
          id: true,
          userId: true,
          name: true,
          email: true,
          profilePhoto: true,
          contactNumber: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              status: true,
              emailVerified: true,
              createdAt: true,
              updatedAt: true,
              isDeleted: true,
              deletedAt: true
            }
          }
        }


      })

      return superAdmin;
    })

    return result;

  } catch (err) {
    console.log("Transaction Error : ", err);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      }
    })
    throw new AppError(status.BAD_REQUEST, "SuperAdmin creation failed");
  }


}



export const UserService = {
  createDoctor, createAdmin, createSuperAdmin
}