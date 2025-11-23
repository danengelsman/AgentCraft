import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../services/logger';
import { config, isProduction } from '../config/production';
import { z } from 'zod';

const logger = createLogger('error-handler');

interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  errors?: any[];
}

export const globalErrorHandler = (
  err: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // If response was already sent, delegate to Express default error handler
  if (res.headersSent) {
    return next(err);
  }

  // Extract error details
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Log error details
  logger.error('Request error', {
    requestId,
    status,
    message,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.session?.userId,
    userAgent: req.get('user-agent'),
    stack: err.stack,
    code: err.code,
    errors: err.errors,
  });

  // Build error response
  const errorResponse: any = {
    error: {
      message: message,
      requestId,
      timestamp: new Date().toISOString(),
    },
  };

  // Handle specific error types
  if (err instanceof z.ZodError) {
    // Validation errors
    res.status(400).json({
      error: {
        message: 'Validation error',
        requestId,
        timestamp: new Date().toISOString(),
        details: err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // Database errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    res.status(503).json({
      error: {
        message: 'Database connection error. Please try again later.',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Foreign key constraint errors
  if (err.code === '23503') {
    res.status(400).json({
      error: {
        message: 'Invalid reference. The related resource does not exist.',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // Unique constraint errors
  if (err.code === '23505') {
    res.status(409).json({
      error: {
        message: 'This resource already exists.',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // OpenAI API errors
  if (err.code === 'insufficient_quota' || status === 429) {
    res.status(503).json({
      error: {
        message: 'AI service temporarily unavailable. Please try again later.',
        requestId,
        timestamp: new Date().toISOString(),
      },
    });
    return;
  }

  // In production, don't leak error details for 500 errors
  if (isProduction && status === 500) {
    errorResponse.error.message = 'An unexpected error occurred. Please try again later.';
  } else if (!isProduction) {
    // In development, include stack trace and additional details
    errorResponse.error.stack = err.stack;
    errorResponse.error.code = err.code;
    if (err.errors) {
      errorResponse.error.details = err.errors;
    }
  }

  // Send error response
  res.status(status).json(errorResponse);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  logger.warn('404 Not Found', {
    requestId,
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.session?.userId,
  });

  res.status(404).json({
    error: {
      message: 'The requested resource was not found.',
      requestId,
      timestamp: new Date().toISOString(),
      path: req.path,
    },
  });
};

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};