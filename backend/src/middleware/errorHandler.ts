import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: Error & { statusCode?: number; code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', err.message);

  // Prisma errors
  if (err.code === 'P2002') {
    res.status(409).json({ success: false, message: 'A record with this data already exists.', errorCode: 'DUPLICATE_RECORD' });
    return;
  }
  if (err.code === 'P2025') {
    res.status(404).json({ success: false, message: 'Record not found.', errorCode: 'NOT_FOUND' });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500
    ? 'An internal error occurred. Please try again.'
    : err.message;

  res.status(statusCode).json({ success: false, message, errorCode: err.code || 'INTERNAL_ERROR' });
};

export class AppError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = 'APP_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Error.captureStackTrace(this, this.constructor);
  }
}
