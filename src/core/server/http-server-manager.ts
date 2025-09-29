import {
  createServer,
  type IncomingMessage,
  type Server,
  type ServerResponse,
} from 'node:http';
import type { Lithia } from 'lithia/types';
import { ErrorHandler } from './error-handler';
import { MiddlewareManager } from './middleware-manager';
import { _LithiaRequest } from './request';
import { RequestProcessor } from './request-processor';
import { _LithiaResponse } from './response';
import { RouterManager } from './routing';

/**
 * HttpServerManager manages HTTP server creation and request handling.
 * Coordinates between specialized services for request processing.
 */
export class HttpServerManager {
  private lithia: Lithia;
  private routerManager: RouterManager;
  private middlewareManager: MiddlewareManager;
  private errorHandler: ErrorHandler;
  private requestProcessor: RequestProcessor;

  constructor(lithia: Lithia) {
    this.lithia = lithia;
    this.routerManager = new RouterManager(lithia);
    this.middlewareManager = new MiddlewareManager(lithia);
    this.errorHandler = new ErrorHandler();
    this.requestProcessor = new RequestProcessor(
      lithia,
      this.routerManager,
      this.middlewareManager,
    );
  }

  /**
   * Creates and configures an HTTP server.
   * @returns {Server} Configured HTTP server
   */
  createServer(): Server {
    const server = createServer(
      async (httpReq: IncomingMessage, httpRes: ServerResponse) => {
        await this.handleRequest(
          new _LithiaRequest(httpReq, this.lithia),
          new _LithiaResponse(httpRes),
        );
      },
    );

    return server;
  }

  /**
   * Handles incoming HTTP requests.
   * Delegates to RequestProcessor for complete request processing.
   * @private
   * @param {_LithiaRequest} req - Request object
   * @param {_LithiaResponse} res - Response object
   */
  private async handleRequest(
    req: _LithiaRequest,
    res: _LithiaResponse,
  ): Promise<void> {
    try {
      await this.requestProcessor.processRequest(req, res);
    } catch (error) {
      this.errorHandler.handleError(
        error,
        res,
        this.lithia.options._env === 'dev',
      );
    }
  }
}
