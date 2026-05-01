import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IAdminUpdatePayload } from "./admin.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { UserStatus } from "../../../generated/prisma/enums";

const getAllAdmins = async () => {
  const result = await prisma.admin.findMany({
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
      createdAt: true,
      updatedAt: true,
    },
  });
  return result;
};

const getAdminById = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id: id,
      isDeleted: false
    }
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }
  return admin;
}

const softDeleteAdmin = async (id: string, user: IRequestUser) => {
  const isAdminExist = await prisma.admin.findUnique({
    where: {
      id,
      isDeleted: false,
    }
  });

  if (!isAdminExist) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  if (isAdminExist.id === user.userId) {
    throw new AppError(status.BAD_REQUEST, "You cant delete yourself");
  }

  const result = await prisma.$transaction(async (tx) => {
    await tx.admin.update({
      where: {
        id: isAdminExist.id
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      }
    });

    await tx.user.update({
      where: {
        id: isAdminExist.userId,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED
      }
    });

    await tx.session.deleteMany({
      where: {
        id: isAdminExist.userId
      }
    });


  })
}

const updateAdminData = async (id: string, payload: IAdminUpdatePayload) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: {
      id: id,
      isDeleted: false
    }
  });

  if (!existingAdmin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  const updatedAdmin = await prisma.admin.update({
    where: {
      id: id,
    },
    data: payload,
  });
  return updatedAdmin;
}


export const AdminService = {
  getAllAdmins, getAdminById, softDeleteAdmin, updateAdminData
}