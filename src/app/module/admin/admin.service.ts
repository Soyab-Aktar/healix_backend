import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IAdminUpdatePayload, IChangeUserStatusPayload } from "./admin.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { Role, UserStatus } from "../../../generated/prisma/enums";

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

const changeUserStatus = async (user: IRequestUser, payload: IChangeUserStatusPayload) => {
  // 1. Super admin can change the status of any user (admin, doctor, patient). Except himself. He cannot change his own status.

  // 2. Admin can change the status of doctor and patient. Except himself. He cannot change his own status. He cannot change the status of super admin and other admin user.

  const isAdminExists = await prisma.admin.findUniqueOrThrow({
    where: {
      email: user.email
    },
    include: {
      user: true,
    }
  });

  const { userId, userStatus } = payload;


  const userToChangeStatus = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    }
  })

  const selfStatusChange = isAdminExists.userId === userId;

  if (selfStatusChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own status");
  };

  if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.SUPER_ADMIN) {
    throw new AppError(status.BAD_REQUEST, "You cannot change the status of super admin. Only super admin can change the status of another super admin");
  }

  if (isAdminExists.user.role === Role.ADMIN && userToChangeStatus.role === Role.ADMIN) {
    throw new AppError(status.BAD_REQUEST, "You cannot change the status of another admin. Only super admin can change the status of another admin");
  }

  if (userStatus === UserStatus.DELETED) {
    throw new AppError(status.BAD_REQUEST, "You cannot set user status to deleted. To delete a user, you have to use role specific delete api. For example, to delete an doctor user, you have to use delete doctor api which will set the user status to deleted and also set isDeleted to true and also delete the user session and account");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    }, data: {
      status: userStatus,
    }
  })

  return updatedUser;
}


export const AdminService = {
  getAllAdmins, getAdminById, softDeleteAdmin, updateAdminData, changeUserStatus,
}