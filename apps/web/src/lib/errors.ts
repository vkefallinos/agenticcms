/**
 * Frontend error handling utilities
 */

export interface FormattedError {
  title: string;
  message: string;
  fields?: Record<string, string>;
}

/**
 * Format API errors for user display
 */
export function formatError(error: any): FormattedError {
  // Network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
    };
  }

  // HTTP errors with response
  if (error.httpStatusCode || error.status) {
    const statusCode = error.httpStatusCode || error.status;

    // Unauthorized
    if (statusCode === 401) {
      return {
        title: 'Authentication Required',
        message: 'Please log in to continue.',
      };
    }

    // Forbidden
    if (statusCode === 403) {
      return {
        title: 'Access Denied',
        message: 'You do not have permission to perform this action.',
      };
    }

    // Not Found
    if (statusCode === 404) {
      return {
        title: 'Not Found',
        message: 'The requested resource could not be found.',
      };
    }

    // Validation errors
    if (statusCode === 400) {
      if (error.modelState) {
        const fields: Record<string, string> = {};
        for (const [field, errors] of Object.entries(error.modelState)) {
          if (Array.isArray(errors) && errors.length > 0) {
            fields[field] = errors[0];
          }
        }
        return {
          title: 'Validation Error',
          message: 'Please correct the errors below.',
          fields,
        };
      }
      return {
        title: 'Invalid Request',
        message: error.message || 'The request contains invalid data.',
      };
    }

    // Conflict
    if (statusCode === 409) {
      return {
        title: 'Conflict',
        message: error.message || 'This record already exists.',
      };
    }

    // Server errors
    if (statusCode >= 500) {
      return {
        title: 'Server Error',
        message: 'An unexpected error occurred. Please try again later.',
      };
    }
  }

  // Remult validation errors
  if (error.modelState) {
    const fields: Record<string, string> = {};
    for (const [field, errors] of Object.entries(error.modelState)) {
      if (Array.isArray(errors) && errors.length > 0) {
        fields[field] = errors[0];
      }
    }
    return {
      title: 'Validation Error',
      message: 'Please correct the errors below.',
      fields,
    };
  }

  // Default error
  return {
    title: 'Error',
    message: error.message || 'An unexpected error occurred.',
  };
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  const formatted = formatError(error);
  return `${formatted.title}: ${formatted.message}`;
}

/**
 * Check if error is a validation error with field-level errors
 */
export function isValidationError(error: any): boolean {
  return !!(error.modelState || (error.httpStatusCode === 400 && error.modelState));
}

/**
 * Extract field errors from a validation error
 */
export function getFieldErrors(error: any): Record<string, string> {
  if (error.modelState) {
    const fields: Record<string, string> = {};
    for (const [field, errors] of Object.entries(error.modelState)) {
      if (Array.isArray(errors) && errors.length > 0) {
        fields[field] = errors[0];
      }
    }
    return fields;
  }
  return {};
}
