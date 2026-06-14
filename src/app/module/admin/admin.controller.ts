import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AdminService } from "./admin.service";
import { Request, Response } from "express";


const getAllAdmins = catchAsync(
  async (req: Request, res: Response) => {
    const result = await AdminService.getAllAdmins();
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "All Admins Data Retrived",
      data: result
    })
  }
)
const getAdminById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await AdminService.getAdminById(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Admin Data Retrived",
      data: result
    })
  }
)
const softDeleteAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = req.user;
    const result = await AdminService.softDeleteAdmin(id as string, user);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Admin Deleted Successfully",
      data: result
    })
  }
)
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../../../generated/prisma/enums";

const updateAdminData = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const user = req.user;

    if (user?.role === Role.ADMIN) {
      const adm = await prisma.admin.findUnique({ where: { id: id as string } });
      if (!adm || adm.userId !== user.userId) {
        throw new AppError(status.FORBIDDEN, "You are not authorized to update this admin profile");
      }
    }

    const result = await AdminService.updateAdminData(id as string, payload);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Admin Updated Successfully",
      data: result
    })
  }
)

const changeUserStatus = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const result = await AdminService.changeUserStatus(user, payload);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User Status Changed Successfully",
      data: result
    })
  }
)
export const AdminController = {
  getAllAdmins, getAdminById, softDeleteAdmin, updateAdminData, changeUserStatus
}
