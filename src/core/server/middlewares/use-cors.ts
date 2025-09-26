import { LithiaRequest, LithiaResponse, LithiaMiddleware } from 'lithia/types';
import { BadRequestError } from '../errors';

/**
 * CORS origin validation function type.
 */
type OriginValidator = (origin: string, request: LithiaRequest) => boolean;

/**
 * CORS configuration options.
 */
interface CorsOptions {
  /**
   * Configures the Access-Control-Allow-Origin CORS header.
   * Can be a string, array of strings, boolean, RegExp, or function.
   */
  origin?: string | string[] | boolean | RegExp | OriginValidator;

  /**
   * Configures the Access-Control-Allow-Methods CORS header.
   */
  methods?: string[];

  /**
   * Configures the Access-Control-Allow-Headers CORS header.
   */
  allowedHeaders?: string[];

  /**
   * Configures the Access-Control-Expose-Headers CORS header.
   */
  exposedHeaders?: string[];

  /**
   * Configures the Access-Control-Allow-Credentials CORS header.
   */
  credentials?: boolean;

  /**
   * Configures the Access-Control-Max-Age CORS header.
   */
  maxAge?: number;

  /**
   * Whether to pass the CORS preflight response to the next handler.
   */
  preflightContinue?: boolean;

  /**
   * Provides a status code to use for successful OPTIONS requests.
   */
  optionsSuccessStatus?: number;
}

/**
 * Default CORS configuration.
 */
const DEFAULT_CORS_OPTIONS: Required<CorsOptions> = {
  origin: '*',
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Accept',
    'Accept-Version',
    'Content-Type',
    'Api-Version',
    'Origin',
    'X-Requested-With',
    'Authorization',
  ],
  exposedHeaders: [],
  credentials: false,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

/**
 * Valid HTTP methods for CORS.
 */
const VALID_HTTP_METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'DELETE',
  'PATCH',
  'OPTIONS',
  'TRACE',
  'CONNECT',
];

/**
 * Validates if a method is a valid HTTP method.
 */
function isValidHttpMethod(method: string): boolean {
  return VALID_HTTP_METHODS.includes(method.toUpperCase());
}

/**
 * Validates CORS configuration options.
 */
function validateCorsOptions(options: CorsOptions): void {
  if (options.methods) {
    const invalidMethods = options.methods.filter(
      (method) => !isValidHttpMethod(method),
    );
    if (invalidMethods.length > 0) {
      throw new BadRequestError(
        `Invalid HTTP methods in CORS configuration: ${invalidMethods.join(', ')}`,
      );
    }
  }

  if (
    options.maxAge !== undefined &&
    (options.maxAge < 0 || !Number.isInteger(options.maxAge))
  ) {
    throw new BadRequestError('CORS maxAge must be a non-negative integer');
  }

  if (options.optionsSuccessStatus !== undefined) {
    if (
      options.optionsSuccessStatus < 200 ||
      options.optionsSuccessStatus > 299
    ) {
      throw new BadRequestError(
        'CORS optionsSuccessStatus must be between 200 and 299',
      );
    }
  }
}

/**
 * Determines if the origin is allowed based on configuration.
 */
function isOriginAllowed(
  origin: string,
  request: LithiaRequest,
  originConfig: CorsOptions['origin'],
): string {
  if (!originConfig) return '';

  // Boolean configuration
  if (typeof originConfig === 'boolean') {
    return originConfig ? origin : '';
  }

  // String configuration
  if (typeof originConfig === 'string') {
    if (originConfig === '*') return '*';
    if (originConfig === origin) return origin;
    return '';
  }

  // Array configuration
  if (Array.isArray(originConfig)) {
    if (originConfig.includes('*')) return '*';
    if (originConfig.includes(origin)) return origin;
    return '';
  }

  // RegExp configuration
  if (originConfig instanceof RegExp) {
    return originConfig.test(origin) ? origin : '';
  }

  // Function configuration
  if (typeof originConfig === 'function') {
    return originConfig(origin, request) ? origin : '';
  }

  return '';
}

/**
 * Creates a CORS middleware with the specified options.
 *
 * @param options - CORS configuration options
 * @returns CORS middleware function
 * @throws {BadRequestError} When configuration is invalid
 */
export function useCors(options: CorsOptions = {}): LithiaMiddleware {
  // Validate configuration
  validateCorsOptions(options);

  // Merge with defaults
  const config = { ...DEFAULT_CORS_OPTIONS, ...options };

  // Validate credentials with wildcard origin
  if (config.credentials && config.origin === '*') {
    throw new BadRequestError(
      'Cannot use Access-Control-Allow-Credentials with wildcard origin (*)',
    );
  }

  return async (
    req: LithiaRequest,
    res: LithiaResponse,
    next: () => void,
  ): Promise<void> => {
    const origin = req.headers.origin || '';
    const isPreflight =
      req.method === 'OPTIONS' &&
      !!req.headers['access-control-request-method'];

    // Determine allowed origin
    const allowedOrigin = isOriginAllowed(origin, req, config.origin);

    // Set CORS headers
    if (allowedOrigin) {
      res.addHeader('Access-Control-Allow-Origin', allowedOrigin);
    }

    if (config.credentials) {
      res.addHeader('Access-Control-Allow-Credentials', 'true');
    }

    if (config.exposedHeaders.length > 0) {
      res.addHeader(
        'Access-Control-Expose-Headers',
        config.exposedHeaders.join(','),
      );
    }

    // Always add Vary header for caching
    res.addHeader('Vary', 'Origin');

    // Handle preflight requests
    if (isPreflight) {
      if (!config.preflightContinue) {
        res.addHeader('Access-Control-Allow-Methods', config.methods.join(','));
        res.addHeader(
          'Access-Control-Allow-Headers',
          config.allowedHeaders.join(','),
        );
        res.addHeader('Access-Control-Max-Age', String(config.maxAge));

        res.status(config.optionsSuccessStatus).end();
        return;
      }
    }

    // Continue to next middleware/handler
    next();
  };
}
