import type { Request, Response, NextFunction } from "express";

interface AppError extends Error {
  status?: number;
  statusCode?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  const status = err.statusCode ?? err.status ?? 500;

  if (process.env.NODE_ENV !== "test") {
    console.error("[ERROR]", {
      message: err.message,
      status,
      stack: err.stack,
    });
  }

  res.status(status).json({
    error: true,
    message: err.message || "Unexpected server error",
  });
}