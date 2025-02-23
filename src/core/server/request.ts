import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { Lithia, LithiaRequest, Params, Query } from 'lithia/types';
import { parse } from 'node:url';

/**
 * Enhanced HTTP request handler wrapping Node.js IncomingMessage
 * @class
 * @implements {LithiaRequest}
 *
 * @property {Readonly<IncomingHttpHeaders>} headers - Immutable request headers
 * @property {Readonly<string>} method - HTTP request method in uppercase
 * @property {Readonly<Params>} params - Route parameters object
 * @property {Readonly<string>} pathname - Normalized URL path without query
 * @property {Readonly<Query>} query - Processed query parameters
 */
export class _LithiaRequest implements LithiaRequest {
  headers: Readonly<IncomingHttpHeaders>;
  method: Readonly<string>;
  params: Readonly<Params>;
  pathname: Readonly<string>;
  query: Readonly<Query>;
  private storage: Map<string, unknown>;

  /**
   * @constructor
   * @param {IncomingMessage} req - Native Node.js request object
   * @param {Lithia} lithia - Reference to Lithia application instance
   */
  constructor(
    private readonly req: IncomingMessage,
    private readonly lithia: Lithia,
  ) {
    const url = parse(req.url!, true);
    this.pathname = url.pathname!;
    this.method = req.method!;
    this.headers = req.headers;
    this.query = parseQuery(new URLSearchParams(url.search ?? ''), this.lithia);
    this.storage = new Map<string, unknown>();
    this.params = {};
    this.on = this.req.on.bind(this.req);

    this.storage.set('lithia', this.lithia);
  }

  /**
   * Event listener interface for request stream events
   * @method
   * @param {'data' | 'end' | 'error'} event - Stream event type
   * @param {(chunk: unknown) => void} listener - Event handler callback
   */
  on: (
    event: 'data' | 'end' | 'error',
    listener: (chunk: unknown) => void,
  ) => void;

  /**
   * Parses request body based on content-type
   * @method
   * @template T - Expected body type
   * @returns {Promise<Readonly<T>>} Parsed body content
   * @throws {Error} For invalid JSON or stream errors
   *
   * @example
   * // JSON body
   * const data = await request.body<{ id: number }>();
   *
   * // Text body
   * const text = await request.body<string>();
   */
  async body<T>(): Promise<Readonly<T>> {
    if (!['POST', 'PUT', 'PATCH'].includes(this.method)) {
      return {} as T;
    }

    if (this.get('body')) {
      return this.get('body') as T;
    }

    const body = await new Promise((resolve, reject) => {
      let body = '';

      this.req.on('data', (chunk) => {
        body += chunk;
      });

      this.req.on('end', () => {
        if (body.length === 0) {
          resolve({} as T);
          return;
        }

        switch (this.headers['content-type']) {
          case 'application/json':
            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(new Error(`Invalid JSON: ${error.message}`));
            }
            break;
          default:
            resolve(body as unknown as T);
        }
      });

      this.req.on('error', (error) => {
        reject(new Error(`Request stream error: ${error.message}`));
      });
    });

    this.set('body', body);

    return body as T;
  }

  /**
   * Retrieves stored data from request context
   * @method
   * @template T - Expected value type
   * @param {string} key - Storage key
   * @returns {T | undefined} Stored value or undefined
   */
  get<T>(key: string): T | undefined {
    return this.storage.get(key) as T;
  }

  /**
   * Stores data in request context
   * @method
   * @param {string} key - Storage key
   * @param {unknown} value - Value to store
   */
  set(key: string, value: unknown): void {
    this.storage.set(key, value);
  }
}

/**
 * Parses URL query parameters with type conversion
 * @function
 * @param {URLSearchParams} url - Raw query parameters
 * @param {Lithia} lithia - Lithia instance for configuration
 * @returns {Query} Processed query parameters object
 *
 * @example
 * // Converts ?num=42&bool=true&arr=1,2,3 to:
 * // { num: 42, bool: true, arr: ['1', '2', '3'] }
 */
export function parseQuery(url: URLSearchParams, lithia: Lithia): Query {
  const { number, boolean, array } = lithia.options.server.request.queryParser;
  const query: Query = {};

  for (const [key, value] of url.entries()) {
    if (number.enabled && !isNaN(Number(value)) && value !== '') {
      query[key] = Number(value);
      continue;
    }

    if (boolean.enabled && (value === 'true' || value === 'false')) {
      query[key] = value === 'true';
      continue;
    }

    if (array.enabled && array.delimiter && value.includes(array.delimiter)) {
      query[key] = value.split(array.delimiter);
      continue;
    }

    query[key] = value;
  }

  return query;
}
