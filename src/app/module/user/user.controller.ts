import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { UserService } from "./user.service";
import { sendResponce } from "../../shared/sendResponce";
import status from "http-status";

const createDoctor = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await UserService.createDoctor(payload);
    sendResponce(res, {
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
    sendResponce(res, {
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
    sendResponce(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Super Admin Create Successfully",
      data: result
    })
  }
)

export const UserController = {
  createDoctor, createAdmin, createSuperAdmin,
}