import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { UserService } from "./user.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const createDoctor = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await UserService.createDoctor(payload);
    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Doctor Create Successfully",
      data: result
    })
  }
)
const createAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await UserService.createAdmin(payload);
    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Admin Create Successfully",
      data: result
    })
  }
)
const createSuperAdmin = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await UserService.createSuperAdmin(payload);
    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Super Admin Create Successfully",
      data: result
    })
  }
)

const uploadImage = catchAsync(
  async (req: Request, res: Response) => {
    if (!req.file) {
      throw new AppError(status.BAD_REQUEST, "File is required");
    }
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: req.file.path,
      }
    })
  }
)

export const UserController = {
  createDoctor, createAdmin, createSuperAdmin, uploadImage,
}