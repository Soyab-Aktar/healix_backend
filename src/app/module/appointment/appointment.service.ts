import { includes, uuidv7 } from "zod";
import { IRequestUser } from "../../interfaces/requestUser.interface"
import { prisma } from "../../lib/prisma"
import { IBookAppointmentPayload } from "./appointment.interface"
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { AppointmentStatus, PaymentStatus, Role } from "../../../generated/prisma/enums";
import { stripe } from "../../config/stripe";
import { envVars } from "../../config/env";

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
    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: [`card`],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Appointment with Dr. ${doctorData.name}`,
            },
            unit_amount: doctorData.appointmentFee * 120,
          },
          quantity: 1,
        }
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `${envVars.FRONTEND_URL}/dashborad/payment/payment-success`,
      // cancel_url: `${envVars.FRONTEND_URL}/dashborad/payment/payment-failed`,
      cancel_url: `${envVars.FRONTEND_URL}/dashborad/appointments`,

    })

    return {
      appointmentData,
      paymentData,
      paymentUrl: session.url,
    };
  })

  return {
    appointment: result.appointmentData,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl,
  };

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
const bookAppointmentWithPayLater = async (payload: IBookAppointmentPayload, user: IRequestUser) => {

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

    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        appointmentId: appointmentData.id,
        amount: doctorData.appointmentFee,
        transactionId,
      }
    })

    return {
      appointmentData,
      paymentData,
    };

  })

  return result;

}


const initiatePayment = async (appointmentId: string, user: IRequestUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    }
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      patientId: patientData.id,
    },
    include: {
      doctor: true,
      payment: true,
    }
  });

  if (appointmentData.payment?.status === PaymentStatus.PAID) {
    throw new AppError(status.BAD_REQUEST, "Payment already completed for this appointment");
  }

  if (!appointmentData.payment) {
    throw new AppError(status.NOT_FOUND, "Payment data not found for this appointment");
  }

  if (appointmentData.status === AppointmentStatus.CANCELED) {
    throw new AppError(status.BAD_REQUEST, "Appointment is canceled");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: [`card`],
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `Appointment with Dr. ${appointmentData.doctor.name}`,
          },
          unit_amount: appointmentData.doctor.appointmentFee * 120,
        },
        quantity: 1,
      }
    ],
    metadata: {
      appointmentId: appointmentData.id,
      paymentId: appointmentData.payment?.id,
    },
    success_url: `${envVars.FRONTEND_URL}/dashborad/payment/payment-success`,
    // cancel_url: `${envVars.FRONTEND_URL}/dashborad/payment/payment-failed`,
    cancel_url: `${envVars.FRONTEND_URL}/dashborad/appointments`,

  })

  return {
    paymentUrl: session.url,
  }


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