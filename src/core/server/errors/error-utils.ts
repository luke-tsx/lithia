import { HttpError } from './base-error';
import { HttpStatusCode } from './types';

/**
 * Utility functions for error handling.
 */
export class ErrorUtils {
  /**
   * Checks if an error is an HTTP error.
   */
  static isHttpError(error: unknown): error is HttpError {
    return (
      error instanceof HttpError ||
      (typeof error === 'object' &&
        error !== null &&
        '_isHttpError' in error &&
        (error as any)._isHttpError === true)
    );
  }

  /**
   * Converts any error to an HTTP error.
   */
  static toHttpError(
    error: unknown,
    defaultStatus: HttpStatusCode = HttpStatusCode.INTERNAL_SERVER_ERROR,
    requestId?: string,
  ): HttpError {
    if (ErrorUtils.isHttpError(error)) {
      return error;
    }

    if (error instanceof Error) {
      return new HttpError(
        defaultStatus,
        error.message,
        { originalError: error.name, stack: error.stack },
        requestId,
      );
    }

    if (typeof error === 'string') {
      return new HttpError(defaultStatus, error, undefined, requestId);
    }

    return new HttpError(
      defaultStatus,
      'An unknown error occurred',
      { originalError: error },
      requestId,
    );
  }

  /**
   * Creates a standardized error response object.
   */
  static createErrorResponse(
    error: HttpError,
    includeStack = false,
  ): Record<string, unknown> {
    const response: Record<string, unknown> = {
      error: {
        name: error.name,
        status: error.status,
        message: error.message,
        timestamp: error.timestamp,
      },
    };

    if (error.code) {
      (response.error as any).code = error.code;
    }

    if (error.data) {
      (response.error as any).data = error.data;
    }

    if (error.requestId) {
      (response.error as any).requestId = error.requestId;
    }

    if (includeStack && error.stack) {
      (response.error as any).stack = error.stack;
    }

    return response;
  }
}
