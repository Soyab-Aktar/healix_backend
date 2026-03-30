import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponce } from "../../shared/sendResponce";

const registerPatient = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerPatient(payload);
    sendResponce(res, {
      httpStatusCode: 201,
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
      httpStatusCode: 200,
      success: true,
      message: "Patient Login Successfully",
      data: result
    })
  }
)


export const AuthController = {
  registerPatient, loginUser,
}