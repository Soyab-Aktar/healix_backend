import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "../config/env";
import { Response } from "express";
import { cookieUtils } from "./cookie";
import ms, { StringValue } from "ms";

const getAccessToken = (payload: JwtPayload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOEKN_EXPIRE_IN } as SignOptions,
  );
  return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
  const refresgToken = jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRE_IN } as SignOptions,
  );
  return refresgToken;
}

const setAccessTokenCookie = (res: Response, token: string) => {
  const maxAge = ms(envVars.ACCESS_TOEKN_EXPIRE_IN as StringValue);
  cookieUtils.setCookie(res, 'accessToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    // 1 Day
    maxAge: 60 * 60 * 60 * 24,
    path: '/',
  });
}
const setRefreshTokenCookie = (res: Response, token: string) => {
  const maxAge = ms(envVars.REFRESH_TOKEN_EXPIRE_IN as StringValue);
  cookieUtils.setCookie(res, 'refreshToken', token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    // 7 Day
    maxAge: 60 * 60 * 60 * 24 * 7,
    path: '/',
  });
}
const setBetterAuthTokenCookie = (res: Response, token: string) => {
  const maxAge = ms(envVars.REFRESH_TOKEN_EXPIRE_IN as StringValue);
  cookieUtils.setCookie(res, 'better-auth.session_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: Number(maxAge),
    path: '/',
  });
}


export const tokenUtils = {
  getAccessToken, getRefreshToken, setAccessTokenCookie, setRefreshTokenCookie, setBetterAuthTokenCookie,
}