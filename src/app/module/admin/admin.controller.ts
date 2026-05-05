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
const updateAdminData = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await AdminService.updateAdminData(id as string, payload);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Admin Updated Successfully",
      data: result
    })
  }
)

export const AdminController = {
  getAllAdmins, getAdminById, softDeleteAdmin, updateAdminData
}
