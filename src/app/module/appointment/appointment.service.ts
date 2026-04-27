import { includes, uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { IBookAppointmentPayload } from "./appointment.interface"
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { AppointmentStatus, Role } from "../../../generated/prisma/enums";

const bookAppointment = async (payload: IBookAppointmentPayload, user: IRequestUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    }
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    }
  });

  const doctorSchedulesData = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: payload.doctorId,
        scheduleId: payload.scheduleId,
      }
    }
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        doctorId: payload.doctorId,
        patientId: patientData.id,
        scheduleId: doctorSchedulesData.scheduleId,
        videoCallingId,
      }
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        }
      },
      data: {
        isBooked: true,
      }
    });

    //TODO : payment Intrigration will be here

    return appointmentData;
  })

  return result;

}
const getMyAppointments = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUnique({
    where: {
      email: user.email,
    }
  });

  const doctorData = await prisma.doctor.findUnique({
    where: {
      email: user.email
    }
  });

  let appointments = [];

  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
      }
    })
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        patient: true,
        schedule: true,
      }
    })
  } else {
    throw new AppError(status.NOT_FOUND, "User Not Found");
  }
}

//* 1. Completed Or Cancelled Appointments should not be allowed to update status
//* 2. Doctors can only update Appoinment status from schedule to inprogress or inprogress to complted or schedule to cancelled.
//* 3. Patients can only cancel the scheduled appointment if it scheduled not completed or cancelled or inprogress. 
//* 4. Admin and Super admin can update to any status.

const changeAppointmentStatus = async (appointmentId: string, appointmentStatus: AppointmentStatus, user: IRequestUser) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      // status: AppointmentStatus.SCHEDULED
    },
    include: {
      doctor: true
    }
  });

  // if (!appointmentData) {
  //     throw new AppError(status.NOT_FOUND, "Appointment not found or already completed/cancelled");
  // }

  if (user?.role === Role.DOCTOR) {
    if (!(user?.email === appointmentData.doctor.email))
      throw new AppError(status.BAD_REQUEST, "This is not your appointment")
  }

  return await prisma.appointment.update({
    where: {
      id: appointmentId
    },
    data: {
      status: appointmentStatus
    }
  })
}
const getMySingleAppointment = async () => {

}
const getAllAppointments = async () => {

}
const bookAppointmentWithPayLater = async () => {

}
const initiatePayment = async () => {

}

export const AppointmentService = {
  bookAppointment,
  getMyAppointments,
  changeAppointmentStatus,
  getMySingleAppointment,
  getAllAppointments,
  bookAppointmentWithPayLater,
  initiatePayment,
}