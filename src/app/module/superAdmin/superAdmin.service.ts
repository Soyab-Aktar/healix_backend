import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IChangeUserRolePayload, ISuperAdminUpdatePayload } from "./superAdmin.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { Role, UserStatus } from "../../../generated/prisma/enums";

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



const changeUserRole = async (user: IRequestUser, payload: IChangeUserRolePayload) => {
  // 1. Super admin can change the role of only other super admin and admin user. He cannot change his own role.

  // 2. Admin cannot change role of any user

  // 3. Role of Patient and Doctor user cannot be changed by anyone. If needed, they have to be deleted and recreated with new role.

  const isSuperAdminExists = await prisma.admin.findFirstOrThrow({
    where: {
      email: user.email,
      user: {
        role: Role.SUPER_ADMIN
      }
    },
    include: {
      user: true,
    }
  });

  const { userId, role } = payload;

  const userToChangeRole = await prisma.user.findUniqueOrThrow({
    where: {
      id: userId,
    }
  })

  const selfRoleChange = isSuperAdminExists.userId === userId;

  if (selfRoleChange) {
    throw new AppError(status.BAD_REQUEST, "You cannot change your own role");
  }

  if (userToChangeRole.role === Role.DOCTOR || userToChangeRole.role === Role.PATIENT) {
    throw new AppError(status.BAD_REQUEST, "You cannot change the role of doctor or patient user. If you want to change the role of doctor or patient user, you have to delete the user and recreate with new role");
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role,
    }
  })

  return updatedUser;

}


export const SuperAdminService = {
  getAllSuperAdmins, getSuperAdminById,
  softDeleteSuperAdmin, updateSuperAdminData,
  changeUserRole,
}