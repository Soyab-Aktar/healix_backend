import { Request, Response } from "express";
import status from "http-status";
import ms, { StringValue } from "ms";
import { envVars } from "../../config/env";
import { catchAsync } from "../../shared/catchAsync";
import { tokenUtils } from "../../utils/token";
import { AuthService } from "./auth.service";
import { sendResponce } from "../../shared/sendResponce";
import AppError from "../../errorHelpers/AppError";
import { cookieUtils } from "../../utils/cookie";
import { auth } from "../../lib/auth";

const registerPatient = catchAsync(
  async (req: Request, res: Response) => {
    const maxAge = ms(envVars.ACCESS_TOKEN_EXPIRES_IN as StringValue);
    console.log({ maxAge });
    const payload = req.body;

    console.log(payload);

    const result = await AuthService.registerPatient(payload);

    const { accessToken, refreshToken, token, ...rest } = result

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    sendResponce(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Patient registered successfully",
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
    const { accessToken, refreshToken, token, ...rest } = result

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token);

    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User logged in successfully",
      data: {
        token,
        accessToken,
        refreshToken,
        ...rest,

      },
    })
  }
)

const getMe = catchAsync(
  async (req: Request, res: Response) => {
    const user = req.user;
    const result = await AuthService.getMe(user);

    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User profile fetched successfully",
      data: result,
    })
  }
)

const getNewToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;
    const betterAuthSessionToken = req.cookies["better-auth.session_token"];
    if (!refreshToken) {
      throw new AppError(status.UNAUTHORIZED, "Refresh Token is Missing");
    }
    if (!betterAuthSessionToken) {
      throw new AppError(status.UNAUTHORIZED, "Session Token is Missing");
    }
    const result = await AuthService.getNewToken(refreshToken, betterAuthSessionToken);

    const { accessToken, refreshToken: newRefreshToken, sessionToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, sessionToken)

    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "User profile fetched successfully",
      data: {
        accessToken,
        refreshToken: newRefreshToken,
        sessionToken,
      },
    })
  }
)

const changePassword = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    const betterAuthSessionToken = req.cookies['better-auth.session_token'];
    const result = await AuthService.changePassword(payload, betterAuthSessionToken);

    const { token, accessToken, refreshToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionCookie(res, token as string);

    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Password Changed successfully",
      data: result
    })
  }
)

const logOutUser = catchAsync(
  async (req: Request, res: Response) => {
    const betterAuthSessionToken = req.cookies['better-auth.session_token'];
    const result = await AuthService.logOutUser(betterAuthSessionToken);

    cookieUtils.clearCookie(res, 'accessToken', {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    cookieUtils.clearCookie(res, 'refreshToken', {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });
    cookieUtils.clearCookie(res, 'better-auth.session_token', {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    const cookie = req.cookies;
    console.log({ cookie })

    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Logout successfully",
      data: result
    })
  }
)

const verifyEmail = catchAsync(
  async (req: Request, res: Response) => {
    const { otp, email } = req.body;
    await AuthService.verifyEmail(otp, email);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Email Verified successfully",
    })
  }
)

const forgotPassword = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;
    await AuthService.forgotPassword(email);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Email ,forgot password request send successfully",
    })
  }
)

const resetPassword = catchAsync(
  async (req: Request, res: Response) => {
    const payload = req.body;
    await AuthService.resetPassword(payload);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Email-Password reset successfully",
    })
  }
)

const googleLogin = catchAsync(
  async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect || "/dashboard";
    const encodeRedirectPath = encodeURIComponent(redirectPath as string);
    const callbackURL = `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success?redirect=${encodeRedirectPath}`;

    res.render("googleRedirect", {
      callbackURL: callbackURL,
      betterAuthUrl: envVars.BETTER_AUTH_URL,
    })
  }
)
const googleLoginSuccess = catchAsync(
  async (req: Request, res: Response) => {
    const redirectPath = req.query.redirect as string || "/dashboard";
    const sessionToken = req.cookies["better-auth.session_token"];
    if (!sessionToken) {
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=oauth_failed`);
    }
    const session = await auth.api.getSession({
      headers: {
        "Cookie": `better-auth.session_token=${sessionToken}`,
      }
    });
    if (!session) {
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_session_found`);
    }
    if (session && !session.user) {
      return res.redirect(`${envVars.FRONTEND_URL}/login?error=no_user_found`);
    }

    const result = await AuthService.googleLoginSuccess(session);

    const { accessToken, refreshToken } = result;

    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setRefreshTokenCookie(res, refreshToken);

    const isValidRedirectPath = redirectPath.startsWith("/") && !redirectPath.startsWith("//");
    const finalRedirectPath = isValidRedirectPath ? redirectPath : "/dashboard";

    res.redirect(`${envVars.FRONTEND_URL}${finalRedirectPath}`);
  }
)

const handleOAuthError = catchAsync(
  async (req: Request, res: Response) => {
    const error = req.query.error as string || "oauth_failed";
    res.redirect(`${envVars.FRONTEND_URL}/login?error=${error}`);
  }
)




export const AuthController = {
  registerPatient,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleLogin,
  googleLoginSuccess,
  handleOAuthError,

};