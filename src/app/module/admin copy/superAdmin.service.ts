import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ISuperAdminUpdatePayload } from "./superAdmin.interface";

const getAllSuperAdmins = async () => {
  const result = await prisma.superAdmin.findMany({
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

const getSuperAdminById = async (id: string) => {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: {
      id: id,
      isDeleted: false
    }
  });

  if (!superAdmin) {
    throw new AppError(status.NOT_FOUND, "Super Admin not found");
  }
  return superAdmin;
}

const softDeleteSuperAdmin = async (id: string) => {
  const superAdmin = await prisma.superAdmin.findUnique({
    where: {
      id: id
    }
  });

  if (!superAdmin) {
    throw new AppError(status.NOT_FOUND, "Super Admin not found");
  }

  if (superAdmin.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "Super Admin Already deleted");
  }

  const result = await prisma.superAdmin.update({
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

const updateSuperAdminData = async (id: string, payload: ISuperAdminUpdatePayload) => {
  const existingSuperAdmin = await prisma.superAdmin.findUnique({
    where: {
      id: id,
      isDeleted: false
    }
  });

  if (!existingSuperAdmin) {
    throw new AppError(status.NOT_FOUND, "Super Admin not found");
  }

  const updatedSuperAdmin = await prisma.superAdmin.update({
    where: {
      id: id,
    },
    data: payload,
  });
  return updatedSuperAdmin;
}


export const SuperAdminService = {
  getAllSuperAdmins, getSuperAdminById, softDeleteSuperAdmin, updateSuperAdminData
}