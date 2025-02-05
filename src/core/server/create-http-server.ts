import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { Lithia, Route, RouteModule } from 'lithia/types';
import { pathToFileURL } from 'node:url';
import { isAsyncFunction } from 'node:util/types';
import { ready } from '../log';
import {
  ConflictError,
  HttpError,
  InternalServerError,
  NotFoundError,
} from './errors';
import { _LithiaRequest } from './request';
import { _LithiaResponse } from './response';
import { getRoutesFromManifest } from './router';

type RouteHandler = (
  req: _LithiaRequest,
  res: _LithiaResponse,
) => Promise<void>;

/**
 * Creates and configures an HTTP server for Lithia application
 * @param {Lithia} lithia - Lithia application instance
 * @returns {Server} Configured HTTP server
 */
export function createHttpServer(lithia: Lithia): Server {
  const server = createServer(
    async (httpReq: IncomingMessage, httpRes: ServerResponse) => {
      await handleRequest(
        new _LithiaRequest(httpReq, lithia),
        new _LithiaResponse(httpRes),
        lithia,
      );
    },
  );

  server.listen(lithia.options.server.port, lithia.options.server.host, () => {
    ready(
      `Server listening on http://${lithia.options.server.host}:${lithia.options.server.port}`,
    );
  });

  return server;
}

/**
 * Handles incoming HTTP requests
 * @async
 * @param {_LithiaRequest} req - Request object
 * @param {_LithiaResponse} res - Response object
 * @param {Lithia} lithia - Lithia application instance
 */
async function handleRequest(
  req: _LithiaRequest,
  res: _LithiaResponse,
  lithia: Lithia,
): Promise<void> {
  try {
    const routes = getRoutesFromManifest(lithia);
    const route = findMatchingRoute(req, routes, lithia.options._env);

    const module = await importRouteModule(route, lithia.options._env);
    validateRouteModule(module);

    if (route.dynamic) {
      extractDynamicParams(req, route);
    }

    await executeHandler(module.default, req, res);
  } catch (error) {
    handleError(error, res, lithia.options._env === 'dev');
  }
}

/**
 * Finds matching route for current request
 * @param {_LithiaRequest} req - Request object
 * @param {RouteModule[]} routes - Available routes
 * @param {string} env - Current environment
 * @returns {RouteModule} Matched route
 * @throws {HttpError} When no route found or multiple matches
 */
function findMatchingRoute(
  req: _LithiaRequest,
  routes: Route[],
  env: string,
): Route {
  const matchedRoutes = routes.filter((route) => {
    const methodMatch = !route.method || route.method === req.method;
    const envMatch = !route.env || route.env === env;
    const pathMatch = new RegExp(route.regex).test(req.pathname);
    return methodMatch && envMatch && pathMatch;
  });

  if (matchedRoutes.length === 0) throw new NotFoundError('No matching routes');
  if (matchedRoutes.length > 1)
    throw new ConflictError(
      'Multiple matching routes found, cannot determine which one to use',
    );

  return matchedRoutes[0];
}

/**
 * Dynamically imports route module with cache control
 * @async
 * @param {RouteModule} route - Route configuration
 * @param {string} env - Current environment
 * @returns {Promise<RouteModule>} Imported module
 */
async function importRouteModule(
  route: Route,
  env: string,
): Promise<RouteModule> {
  const cacheBuster = env === 'dev' ? `?updated=${Date.now()}` : '';
  return import(`${pathToFileURL(route.filePath).href}${cacheBuster}`);
}

/**
 * Validates route module structure
 * @param {RouteModule} module - Imported module
 * @throws {HttpError} For invalid module exports
 */
function validateRouteModule(module: RouteModule): void {
  if (typeof module?.default !== 'function') {
    throw new InternalServerError(
      'Route module must export a default function',
    );
  }
  if (!isAsyncFunction(module.default)) {
    throw new InternalServerError('Route handler must be an async function');
  }
}

/**
 * Extracts dynamic parameters from request path
 * @param {_LithiaRequest} req - Request object
 * @param {RouteModule} route - Matched route
 */
function extractDynamicParams(req: _LithiaRequest, route: Route): void {
  const matches = req.pathname.match(new RegExp(route.regex)) || [];
  const paramNames = (route.path.match(/:([^/]+)/g) || []).map((p) =>
    p.slice(1),
  );

  req.params = paramNames.reduce(
    (acc, name, index) => ({
      ...acc,
      [name]: matches[index + 1],
    }),
    {},
  );
}

/**
 * Executes route handler with cleanup
 * @async
 * @param {RouteHandler} handler - Route handler function
 * @param {_LithiaRequest} req - Request object
 * @param {_LithiaResponse} res - Response object
 */
async function executeHandler(
  handler: RouteHandler,
  req: _LithiaRequest,
  res: _LithiaResponse,
): Promise<void> {
  await handler(req, res);
  if (!res._ended) res.end();
}

/**
 * Handles errors and sends appropriate response
 * @param {unknown} error - Caught error
 * @param {_LithiaResponse} res - Response object
 * @param {boolean} isDev - Development mode flag
 */
function handleError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  res: _LithiaResponse,
  isDev: boolean,
): void {
  const httpError = checkIsHttpError(error)
    ? error
    : new InternalServerError(
        'Internal Server Error',
        isDev ? error : undefined,
      );

  if (res._ended) return;

  res.status(httpError.status).json({
    status: httpError.status,
    message: httpError.message,
    data: httpError.data,
    ...(isDev && {
      stack: httpError.stack,
    }),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkIsHttpError(error: any): error is HttpError {
  return error._isHttpError ? true : false;
}
