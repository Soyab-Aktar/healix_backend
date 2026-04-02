import { Role, Specialty } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateDoctorPayload } from "./user.interface";

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
      throw new Error(`Specialty with id ${specialtyId} not found`);
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
    throw new Error("User already exist");
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



export const UserService = {
  createDoctor,
}