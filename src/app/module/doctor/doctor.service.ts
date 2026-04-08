import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma"
import { IUpdateDoctorPayload } from "./doctor.interface";

const getAllDoctors = async () => {
  // Fetch all non-deleted doctors
  const result = await prisma.doctor.findMany({
    where: {
      isDeleted: false,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      profilePhoto: true,
      contactNumber: true,
      registrationNumber: true,
      experience: true,
      gender: true,
      appointmentFee: true,
      qualification: true,
      currentWorkingPlace: true,
      designation: true,
      averageRating: true,
      createdAt: true,
      updatedAt: true,
      specialties: {
        select: {
          specialty: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      },
    },
  });
  const doctors = result.map((doctor) => ({
    ...doctor,
    specialties: doctor.specialties.map((s) => s.specialty),
  }));
  return doctors;
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
  const doctor = await prisma.doctor.findUnique({
    where: {
      id: id
    }
  });

  if (!doctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  if (doctor.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Doctor Already deleted");
  }

  const result = await prisma.doctor.update({
    where: {
      id: id
    },
    data: {
      isDeleted: true,
      deleteAt: new Date(),
    }
  });

  return result;

}

const updateDoctorData = async (id: string, payload: IUpdateDoctorPayload) => {
  const existingDoctor = await prisma.doctor.findUnique({
    where: {
      id: id,
      isDeleted: false
    }
  });

  if (!existingDoctor) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  const { specialties, ...doctorData } = payload;

  const updatedDoctor = await prisma.doctor.update({
    where: {
      id: id,
    },
    data: doctorData,
    include: {
      specialties: {
        include: {
          specialty: true
        }
      }
    }
  });

  if (specialties && specialties.length > 0) {
    await prisma.doctorSpecialty.deleteMany({
      where: {
        doctorId: id,
      }
    });

    const specialtiesData = specialties.map((specialtyId) => ({
      doctorId: id,
      specialtyId,
    }));

    await prisma.doctorSpecialty.createMany({
      data: specialtiesData,
    });

    const result = await prisma.doctor.findUnique({
      where: { id },
      include: {
        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });

    return {
      ...result,
      specialties: result?.specialties.map((s) => s.specialty) || [],
    };
  }

  return {
    ...updatedDoctor,
    specialties: updatedDoctor.specialties.map((s) => s.specialty),
  }
}


export const DoctorService = {
  getAllDoctors, getDoctorsById, softDeleteDoctor, updateDoctorData,
}