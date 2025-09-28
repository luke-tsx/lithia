/**
 * HTTP Error System - Main Export File
 *
 * This module provides a comprehensive HTTP error handling system with:
 * - All standard HTTP status codes
 * - Base error class with advanced features
 * - Specific error classes for common scenarios
 * - Factory patterns for error creation
 * - Utility functions for error handling
 */

// Types and Enums
export { HttpStatusCode, type ErrorData } from './types';

// Base Error Class
export { HttpError } from './base-error';

// Client Error Classes (4xx)
export {
  BadRequestError,
  UnauthorizedError,
  PaymentRequiredError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  NotAcceptableError,
  ProxyAuthenticationRequiredError,
  RequestTimeoutError,
  ConflictError,
  GoneError,
  LengthRequiredError,
  PreconditionFailedError,
  PayloadTooLargeError,
  UriTooLongError,
  UnsupportedMediaTypeError,
  RangeNotSatisfiableError,
  ExpectationFailedError,
  ImATeapotError,
  MisdirectedRequestError,
  UnprocessableEntityError,
  LockedError,
  FailedDependencyError,
  TooEarlyError,
  UpgradeRequiredError,
  PreconditionRequiredError,
  TooManyRequestsError,
  RequestHeaderFieldsTooLargeError,
  UnavailableForLegalReasonsError,
} from './client-errors';

// Server Error Classes (5xx)
export {
  InternalServerError,
  NotImplementedError,
  BadGatewayError,
  ServiceUnavailableError,
  GatewayTimeoutError,
  HttpVersionNotSupportedError,
  VariantAlsoNegotiatesError,
  InsufficientStorageError,
  LoopDetectedError,
  NotExtendedError,
  NetworkAuthenticationRequiredError,
} from './server-errors';

// Factory Classes and Methods
export { HttpErrorFactory, ErrorFactory } from './error-factory';

// Utility Functions
export { ErrorUtils } from './error-utils';
