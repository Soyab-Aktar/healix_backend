import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";
import { SuperAdminService } from "./superAdmin.service";


const getAllSuperAdmins = catchAsync(
  async (req: Request, res: Response) => {
    const result = await SuperAdminService.getAllSuperAdmins();
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "All Super Admins Data Retrived",
      data: result
    })
  }
)
const getSuperAdminById = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SuperAdminService.getSuperAdminById(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Super Admin Data Retrived",
      data: result
    })
  }
)
const softDeleteSuperAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await SuperAdminService.softDeleteSuperAdmin(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Super Admin Deleted Successfully",
      data: result
    })
  }
)
const updateSuperAdminData = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await SuperAdminService.updateSuperAdminData(id as string, payload);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Super Admin Updated Successfully",
      data: result
    })
  }
)

export const SuperAdminController = {
  getAllSuperAdmins, getSuperAdminById, softDeleteSuperAdmin, updateSuperAdminData,
}
