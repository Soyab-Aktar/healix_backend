import { NextFunction, Request, Response } from "express";

type ApiResponseBody = {
  success?: boolean;
  message?: string;
};

const getRequestState = (statusCode: number, success?: boolean) => {
  if (typeof success === "boolean") {
    return success ? "called successfully" : "request failed";
  }

  if (statusCode >= 200 && statusCode < 400) {
    return "called successfully";
  }

  return "request failed";
};

export const apiLogger = (req: Request, res: Response, next: NextFunction) => {
  const isApiRequest =
    req.originalUrl.startsWith("/api") || req.originalUrl.startsWith("/webhook");

  if (!isApiRequest) {
    return next();
  }

  const startedAt = Date.now();
  let responseMessage = "";
  let responseSuccess: boolean | undefined;

  const originalJson = res.json.bind(res);

  res.json = ((body: ApiResponseBody) => {
    responseMessage = body?.message ?? "";
    responseSuccess = body?.success;
    return originalJson(body);
  }) as Response["json"];

  res.on("finish", () => {
    const duration = Date.now() - startedAt;
    const requestState = getRequestState(res.statusCode, responseSuccess);
    const logMessage = responseMessage || "No response message";

    console.log(
      `[API] ${req.method} ${req.originalUrl} -> ${requestState} | status: ${res.statusCode} | message: ${logMessage} | ${duration}ms`,
    );
  });

  next();
};
