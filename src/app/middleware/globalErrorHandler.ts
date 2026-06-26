/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import z from "zod";
import { Prisma } from "../../generated/prisma/client";
import { envVars } from "../config/env";
import AppError from "../errorHelpers/AppError";
import { handlePrismaClientKnownRequestError, handlePrismaClientUnknownError, handlePrismaClientValidationError, handlerPrismaClientInitializationError, handlerPrismaClientRustPanicError } from "../errorHelpers/handlePrismaErrors";
import { handleZodError } from "../errorHelpers/handleZodError";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteFilesFromGlobalErrorHandler";


export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
  if (envVars.NODE_ENV === 'development') {
    console.log("Error from Global Error Handler", err);
  }
  await deleteUploadedFilesFromGlobalErrorHandler(req);

  let errorSources: TErrorSources[] = []
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = 'Internal Server Error';
  let stack: string | undefined = undefined;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    const simplifiedError = handlePrismaClientKnownRequestError(err);
    statusCode = simplifiedError.statusCode as number
    message = simplifiedError.message
    errorSources = [...simplifiedError.errorSources]
    stack = err.stack;

  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    const simplifiedError = handlePrismaClientUnknownError(err);
    statusCode = simplifiedError.statusCode as number
    message = simplifiedError.message
    errorSources = [...simplifiedError.errorSources]
    stack = err.stack;

  } else if (err instanceof Prisma.PrismaClientValidationError) {
    const simplifiedError = handlePrismaClientValidationError(err)
    statusCode = simplifiedError.statusCode as number
    message = simplifiedError.message
    errorSources = [...simplifiedError.errorSources]
    stack = err.stack;

  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    const simplifiedError = handlerPrismaClientRustPanicError();
    statusCode = simplifiedError.statusCode as number
    message = simplifiedError.message
    errorSources = [...simplifiedError.errorSources]
    stack = err.stack;

  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    const simplifiedError = handlerPrismaClientInitializationError(err);
    statusCode = simplifiedError.statusCode as number
    message = simplifiedError.message
    errorSources = [...simplifiedError.errorSources]
    stack = err.stack;

  } else if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode as number
    message = simplifiedError.message
    errorSources = [...simplifiedError.errorSources]
    stack = err.stack;

  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: '',
        message: err.message
      }
    ]
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = status.UNAUTHORIZED;
    message = 'Invalid token';
    errorSources = [
      {
        path: 'token',
        message: err.message
      }
    ];
    stack = err.stack;
  } else if (err.name === 'TokenExpiredError') {
    statusCode = status.UNAUTHORIZED;
    message = 'Token has expired';
    errorSources = [
      {
        path: 'token',
        message: err.message
      }
    ];
    stack = err.stack;
  } else if (err instanceof SyntaxError && 'status' in err && (err as Record<string, unknown>).status === 400 && 'body' in err) {
    statusCode = status.BAD_REQUEST;
    message = 'Invalid JSON in request body';
    errorSources = [
      {
        path: 'body',
        message: err.message
      }
    ];
    stack = err.stack;
  } else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message
    stack = err.stack;
    errorSources = [
      {
        path: '',
        message: err.message
      }
    ]
  }


  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSources,
    statusCode,
    error: envVars.NODE_ENV === 'development' ? err : undefined,
    stack: envVars.NODE_ENV === 'development' ? stack : undefined,
  }

  res.status(statusCode).json(errorResponse);
}