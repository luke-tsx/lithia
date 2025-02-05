import { OutgoingHttpHeaders, ServerResponse } from 'http';
import { LithiaResponse } from 'lithia/types';

/**
 * Enhanced HTTP response handler wrapping Node.js ServerResponse
 * @class
 * @implements {LithiaResponse}
 *
 * @property {boolean} _ended - Internal flag tracking response completion state
 * @property {ServerResponse} res - Native Node.js response object
 */
export class _LithiaResponse implements LithiaResponse {
  _ended = false;

  /**
   * @constructor
   * @param {ServerResponse} res - Native Node.js ServerResponse instance
   */
  constructor(private res: ServerResponse) {}

  /**
   * Validates response state before allowing modifications
   * @private
   * @throws {Error} When attempting to modify headers or status after response completion
   */
  private checkIfEnded(): void {
    if (this._ended) {
      throw new Error('Cannot modify headers or status after response is sent');
    }
  }

  /**
   * Sets HTTP status code for the response
   * @method
   * @param {number} status - Valid HTTP status code (100-599 inclusive)
   * @returns {LithiaResponse} Current instance for chaining
   * @throws {Error} When status code is outside valid range
   */
  status(status: number): LithiaResponse {
    this.checkIfEnded();

    if (status < 100 || status > 599) {
      throw new Error(`Invalid HTTP status code: ${status}. Must be 100-599`);
    }

    this.res.statusCode = status;
    return this;
  }

  /**
   * Retrieves current response headers
   * @method
   * @returns {Readonly<OutgoingHttpHeaders>} Immutable copy of current headers
   */
  headers(): Readonly<OutgoingHttpHeaders> {
    return this.res.getHeaders();
  }

  /**
   * Bulk sets multiple response headers
   * @method
   * @param {OutgoingHttpHeaders} headers - Object containing header key-value pairs
   * @returns {LithiaResponse} Current instance for chaining
   */
  setHeaders(headers: OutgoingHttpHeaders): LithiaResponse {
    this.checkIfEnded();
    Object.entries(headers).forEach(([name, value]) => {
      this.res.setHeader(name, value || '');
    });
    return this;
  }

  /**
   * Sets a single response header
   * @method
   * @param {string} name - Header name (case-insensitive)
   * @param {string|number|string[]} value - Header value(s)
   * @returns {LithiaResponse} Current instance for chaining
   */
  addHeader(name: string, value: string | number | string[]): LithiaResponse {
    this.checkIfEnded();
    this.res.setHeader(name, value);
    return this;
  }

  /**
   * Removes a previously set header
   * @method
   * @param {string} name - Header name to remove
   * @returns {LithiaResponse} Current instance for chaining
   */
  removeHeader(name: string): LithiaResponse {
    this.checkIfEnded();
    this.res.removeHeader(name);
    return this;
  }

  /**
   * Finalizes response without sending body content
   * @method
   * @throws {Error} If response already completed
   */
  end(): void {
    this.checkIfEnded();
    this.res.end();
    this._ended = true;
  }

  /**
   * Sends JSON response with proper content-type
   * @method
   * @param {object} data - Serializable JavaScript object
   * @throws {Error} If JSON serialization fails (falls back to 500 error)
   */
  json(data: object): void {
    this.checkIfEnded();

    try {
      const json = JSON.stringify(data);
      this.res.setHeader('Content-Type', 'application/json; charset=utf-8');
      this.res.end(json);
    } catch {
      this.res.statusCode = 500;
      this.res.end('Internal Server Error');
    } finally {
      this._ended = true;
    }
  }

  /**
   * Universal send method handling multiple data types
   * @method
   * @param {unknown} data - Response body content (Buffer/String/Object/undefined)
   *
   * @example
   * // Send text
   * response.send('Hello World');
   *
   * // Send JSON
   * response.send({ key: 'value' });
   *
   * // Send binary data
   * response.send(Buffer.from('binary'));
   */
  send(data?: unknown): void {
    this.checkIfEnded();

    try {
      if (data === undefined || data === null) {
        return this.end();
      }

      switch (typeof data) {
        case 'object':
          if (Buffer.isBuffer(data)) {
            if (!this.res.getHeader('Content-Type')) {
              this.addHeader('Content-Type', 'application/octet-stream');
            }
            this.res.end(data);
          } else {
            this.json(data);
          }
          break;

        case 'string':
          if (!this.res.getHeader('Content-Type')) {
            this.addHeader('Content-Type', 'text/plain; charset=utf-8');
          }
          this.res.end(data);
          break;

        default:
          if (!this.res.getHeader('Content-Type')) {
            this.addHeader('Content-Type', 'text/plain; charset=utf-8');
          }
          this.res.end(String(data));
      }
    } finally {
      this._ended = true;
    }
  }

  /**
   * Performs HTTP redirect
   * @method
   * @param {string} url - Absolute or relative redirect URL
   * @param {number} [status=302] - HTTP redirect status code
   */
  redirect(url: string, status: number = 302): void {
    this.checkIfEnded();

    this.status(status).addHeader('Location', url).end();
  }
}
