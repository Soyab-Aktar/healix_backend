import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { AuthService } from "./auth.service";
import { sendResponce } from "../../shared/sendResponce";
import status from "http-status";
import { tokenUtils } from "../../utils/token";

const registerPatient = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.registerPatient(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    if (token) {
      tokenUtils.setBetterAuthTokenCookie(res, token);
    }
    sendResponce(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Patient Registered Successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest,
      }
    })
  }
)
const loginUser = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await AuthService.loginUser(payload);
    const { accessToken, refreshToken, token, ...rest } = result;
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    if (token) {
      tokenUtils.setBetterAuthTokenCookie(res, token);
    }
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Patient Login Successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest,

      }
    })
  }
)


export const AuthController = {
  registerPatient, loginUser,
}
