import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z, { promise } from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";



export const globalErrorHandler = async (err: any, req: Request, res: Response, next: NextFunction) => {
  if (envVars.NODE_ENV === 'development') {
    console.log("Error from Global Error Handler", err);
  }

  if (req.file) {
    await deleteFileFromCloudinary(req.file.path);
  }

  if (req.files && Array.isArray(req.files) && req.files.length > 0) {
    const imageURLs = req.files.map((file) => file.path);
    await Promise.all(imageURLs.map(url => deleteFileFromCloudinary(url)));
  }

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = 'Internal Server Error';
  let errorSources: TErrorSources[] = [];

  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources = [...simplifiedError.errorSources]
  }
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message
      }
    ];
  }
  else if (err instanceof Error) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    errorSources = [
      {
        path: '',
        message: err.message
      }
    ];
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message: message,
    errorSources,
    error: envVars.NODE_ENV === 'development' ? err : undefined,
    stack: envVars.NODE_ENV === 'development' ? err : undefined,
  }


  res.status(statusCode).json(errorResponse);
}
