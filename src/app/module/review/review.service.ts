import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload } from "./review.interface";
import { PaymentStatus, Role } from "../../../generated/prisma/enums";

const giveReview = async (user: IRequestUser, payload: ICreateReviewPayload) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email
    }
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId
    }
  });

  if (appointmentData.paymentStatus !== PaymentStatus.PAID) {
    throw new AppError(status.BAD_REQUEST, "You can only review after payment is done");
  };

  if (appointmentData.patientId !== patientData.id) {
    throw new AppError(status.BAD_REQUEST, "You can only review for your own appointments");
  };

  const isReviewd = await prisma.review.findFirst({
    where: {
      appointmentId: payload.appointmentId
    }
  });

  if (isReviewd) {
    throw new AppError(status.BAD_REQUEST, "You have already reviewd for this appointment");
  }

  const result = await prisma.$transaction(async (tx) => {
    const review = await tx.review.create({
      data: {
        ...payload,
        patientId: appointmentData.patientId,
        doctorId: appointmentData.doctorId,
      }
    });

    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId
      },
      _avg: {
        rating: true,
      }
    });

    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      }
    });

    return review;
  });

  return result;
}

const getAllReviews = async () => {
  const reviews = await prisma.review.findMany({
    include: {
      doctor: true,
      patient: true,
      appointment: true,
    }
  })

  return reviews;
}

const myReviews = async (user: IRequestUser) => {
  const isUserExist = await prisma.user.findUnique({
    where: {
      email: user.email
    }
  });

  if (!isUserExist) {
    throw new AppError(status.BAD_REQUEST, "Only Patients can view reviews");
  }

  if (isUserExist.role === Role.DOCTOR) {
    const doctorData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      }
    });
    return await prisma.review.findMany({
      where: {
        doctorId: doctorData.id
      },
      include: {
        patient: true,
        appointment: true,
      }
    })
  };

  if (isUserExist.role === Role.PATIENT) {
    const patientData = await prisma.doctor.findUniqueOrThrow({
      where: {
        email: user.email,
      }
    });
    return await prisma.review.findMany({
      where: {
        doctorId: patientData.id
      },
      include: {
        doctor: true,
        appointment: true,
      }
    })
  };
}

const updateReview = async (user: IRequestUser, reviewId: string, payload: ICreateReviewPayload) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email
    }
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: payload.appointmentId
    }
  });

  const reviewData = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId,
    }
  })

  const result = await prisma.$transaction(async (tx) => {
    const updatedReview = await tx.review.update({
      where: {
        id: reviewData.id,
      },
      data: {
        ...payload,
      }
    });

    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: appointmentData.doctorId
      },
      _avg: {
        rating: true,
      }
    });

    await tx.doctor.update({
      where: {
        id: appointmentData.doctorId
      },
      data: {
        averageRating: averageRating._avg.rating as number,
      }
    });

    return updatedReview;
  });

  return result;
}

const deleteReview = async (user: IRequestUser, reviewId: string) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email
    }
  });
  const reviewData = await prisma.review.findUniqueOrThrow({
    where: {
      id: reviewId
    }
  });
  if (!(patientData.id === reviewData.patientId)) {
    throw new AppError(status.BAD_REQUEST, "This is not your review!")
  }


  const result = await prisma.$transaction(async (tx) => {
    const deletedReview = await tx.review.delete({
      where: {
        id: reviewId
      }
    });

    const averageRating = await tx.review.aggregate({
      where: {
        doctorId: deletedReview.doctorId
      },
      _avg: {
        rating: true
      }
    });

    await tx.doctor.update({
      where: {
        id: deletedReview.doctorId
      },
      data: {
        averageRating: averageRating._avg.rating as number
      }
    })
    return deletedReview;
  });

  return result;
}

export const ReviewService = {
  giveReview,
  getAllReviews,
  myReviews,
  updateReview,
  deleteReview,

}