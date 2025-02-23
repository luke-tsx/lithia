import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { Metadata, Params, Query } from './route';

/**
 * Represents an incoming HTTP request with enhanced capabilities
 * @interface
 */
export interface LithiaRequest {
  /** Immutable URL path component */
  pathname: Readonly<string>;
  /** Uppercase HTTP method (GET/POST/PUT etc) */
  method: Readonly<string>;
  /** Immutable map of request headers */
  headers: Readonly<IncomingHttpHeaders>;
  /** Processed query parameters with type conversion */
  query: Readonly<Query>;
  /** Route parameters from dynamic path segments */
  params: Readonly<Params>;

  /**
   * Parses and returns request body
   * @template T - Expected body type
   * @returns {Promise<Readonly<T>>} Parsed body content
   */
  body: <T>() => Promise<Readonly<T>>;

  /**
   * Retrieves context value by key
   * @template T - Expected value type
   * @param {string} key - Storage key
   * @returns {T | undefined} Stored value or undefined
   */
  get: <T>(key: string) => T | undefined;

  /**
   * Stores value in request context
   * @param {string} key - Storage key
   * @param {unknown} value - Value to store
   */
  set: (key: string, value: unknown) => void;

  /**
   * Handles request stream events
   * @param {'data' | 'end' | 'error'} event - Event type
   * @param {(chunk: unknown) => void} listener - Event handler
   */
  on: (
    event: 'data' | 'end' | 'error',
    listener: (chunk: unknown) => void,
  ) => void;
}

/**
 * Represents the HTTP response interface with chainable methods
 */
export interface LithiaResponse {
  /** Current HTTP status code */
  statusCode: number;

  /**
   * Sets HTTP status code
   * @param {number} status - Valid HTTP status code
   * @returns {LithiaResponse} Instance for chaining
   */
  status: (status: number) => LithiaResponse;

  /**
   * Retrieves current response headers
   * @returns {Readonly<OutgoingHttpHeaders>} Immutable headers copy
   */
  headers: () => Readonly<OutgoingHttpHeaders>;

  /**
   * Adds/updates a response header
   * @param {string} name - Header name
   * @param {string} value - Header value
   * @returns {LithiaResponse} Instance for chaining
   */
  addHeader: (name: string, value: string) => LithiaResponse;

  /**
   * Removes a response header
   * @param {string} name - Header name to remove
   * @returns {LithiaResponse} Instance for chaining
   */
  removeHeader: (name: string) => LithiaResponse;

  /**
   * Sends response with automatic content handling
   * @param {unknown} [data] - Response payload (string/object/buffer)
   */
  send: (data?: unknown) => void;

  /** Finalizes response without body */
  end: () => void;

  /**
   * Sends JSON response with proper headers
   * @param {object} data - JSON-serializable object
   */
  json: (data: object) => void;

  /**
   * Handles response stream events
   * @param {'data' | 'end' | 'error'} event - Event type
   * @param {(chunk: unknown) => void} listener - Event handler
   */
  on: (
    event: 'close' | 'drain' | 'error' | 'finish' | 'pipe' | 'unpipe',
    listener: (chunk: unknown) => void,
  ) => void;
}

/**
 * Core request handler type for route processing
 * @async
 * @callback LithiaHandler
 * @param {LithiaRequest} req - Request object
 * @param {LithiaResponse} res - Response object
 * @returns {Promise<void>}
 */
export type LithiaHandler = (
  req: LithiaRequest,
  res: LithiaResponse,
) => Promise<void>;

/**
 * Middleware handler type for pre/post processing
 * @async
 * @callback LithiaMiddleware
 * @param {LithiaRequest} req - Request object
 * @param {LithiaResponse} res - Response object
 * @param {Function} next - Proceeds to next middleware/handler
 * @returns {Promise<void>}
 */
export type LithiaMiddleware = (
  req: LithiaRequest,
  res: LithiaResponse,
  next: () => void,
) => Promise<void>;

/**
 * Route module definition structure
 * @typedef {Object} RouteModule
 * @property {LithiaHandler} default - Primary route handler
 * @property {LithiaMiddleware[]} [middlewares] - Array of middleware functions
 * @property {unknown} [metadata] - Additional route metadata
 */
export type RouteModule = {
  /** Required main route handler */
  default?: LithiaHandler;
  /** Optional middleware chain */
  middlewares?: LithiaMiddleware[];
  /** Custom route metadata */
  metadata?: Metadata;
};
