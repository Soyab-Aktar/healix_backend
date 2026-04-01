import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponce } from "../../shared/sendResponce";
import status from "http-status";

const registerPatient = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerPatient(payload);
    sendResponce(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Patient Registered Successfully",
      data: result
    })
  }
)
const loginUser = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Patient Login Successfully",
      data: result
    })
  }
)


export const AuthController = {
  registerPatient, loginUser,
}