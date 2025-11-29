import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Custom application error class with status code
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Format validation errors from Remult or Fastify
 */
export function formatValidationError(error: any): {
  message: string;
  fields?: Record<string, string>;
} {
  // Remult validation errors
  if (error.modelState) {
    const fields: Record<string, string> = {};
    for (const [field, errors] of Object.entries(error.modelState)) {
      if (Array.isArray(errors) && errors.length > 0) {
        fields[field] = errors[0];
      }
    }
    return {
      message: 'Validation failed',
      fields,
    };
  }

  // Fastify validation errors
  if (error.validation) {
    const fields: Record<string, string> = {};
    for (const err of error.validation) {
      const field = err.dataPath || err.instancePath || 'unknown';
      fields[field] = err.message || 'Invalid value';
    }
    return {
      message: 'Validation failed',
      fields,
    };
  }

  return { message: error.message || 'Validation failed' };
}

/**
 * Global error handler for Fastify
 */
export async function globalErrorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  // Log error details for debugging
  request.log.error({
    error: {
      message: error.message,
      stack: error.stack,
      statusCode: error.statusCode,
      code: error.code,
    },
    request: {
      method: request.method,
      url: request.url,
      headers: request.headers,
    },
  });

  // Handle specific error types
  if (error.statusCode === 401) {
    return reply.status(401).send({
      error: 'Unauthorized',
      message: 'Authentication required',
    });
  }

  if (error.statusCode === 403) {
    return reply.status(403).send({
      error: 'Forbidden',
      message: 'You do not have permission to perform this action',
    });
  }

  if (error.statusCode === 404) {
    return reply.status(404).send({
      error: 'Not Found',
      message: 'The requested resource was not found',
    });
  }

  // Validation errors (400)
  if (error.statusCode === 400 || error.validation) {
    const formatted = formatValidationError(error);
    return reply.status(400).send({
      error: 'Validation Error',
      ...formatted,
    });
  }

  // Database errors
  if (error.code?.startsWith('23')) {
    // PostgreSQL constraint violation
    if (error.code === '23505') {
      return reply.status(409).send({
        error: 'Conflict',
        message: 'A record with this information already exists',
      });
    }
    if (error.code === '23503') {
      return reply.status(400).send({
        error: 'Bad Request',
        message: 'Referenced record does not exist',
      });
    }
  }

  // Custom app errors
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: error.name,
      message: error.message,
      code: error.code,
    });
  }

  // Default to 500 for unknown errors
  const statusCode = error.statusCode || 500;
  const isDevelopment = process.env.NODE_ENV === 'development';

  return reply.status(statusCode).send({
    error: 'Internal Server Error',
    message: isDevelopment
      ? error.message
      : 'An unexpected error occurred. Please try again later.',
    ...(isDevelopment && { stack: error.stack }),
  });
}

/**
 * Not found handler
 */
export async function notFoundHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.status(404).send({
    error: 'Not Found',
    message: `Route ${request.method} ${request.url} not found`,
  });
}
