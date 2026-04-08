import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IAdminUpdatePayload } from "./admin.interface";

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

const softDeleteAdmin = async (id: string) => {
  const admin = await prisma.admin.findUnique({
    where: {
      id: id
    }
  });

  if (!admin) {
    throw new AppError(status.NOT_FOUND, "Admin not found");
  }

  if (admin.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Admin Already deleted");
  }

  const result = await prisma.admin.update({
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