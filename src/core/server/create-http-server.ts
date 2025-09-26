import { createServer, IncomingMessage, Server, ServerResponse } from 'http';
import { Lithia, LithiaMiddleware, Route, RouteModule } from 'lithia/types';
import {
  ConflictError,
  HttpError,
  InternalServerError,
  NotFoundError,
} from './errors';
import { _LithiaRequest } from './request';
import { _LithiaResponse } from './response';
import {
  extractDynamicParams,
  getRoutesFromManifest,
  importRouteModule,
} from './router';
import { DefaultRouteValidator } from './validation';

// Global flag to prevent duplicate server messages
const serverMessageShown = false;

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
    await executeGlobalMiddlewares(req, res, lithia);
    if (res._ended) return;

    const route = await findAndValidateRoute(req, lithia);
    const module = await importAndValidateModule(route, lithia);

    await executeRouteMiddlewares(req, res, module);
    if (res._ended) return;

    await executeRouteHandler(req, res, route, module);
  } catch (error) {
    handleError(error, res, lithia.options._env === 'dev');
  }
}

/**
 * Executes global middlewares
 */
async function executeGlobalMiddlewares(
  req: _LithiaRequest,
  res: _LithiaResponse,
  lithia: Lithia,
): Promise<void> {
  res.addHeader('X-Powered-By', 'Lithia');
  await runMiddleware(lithia.options.globalMiddlewares, req, res);
}

/**
 * Finds and validates the matching route
 */
async function findAndValidateRoute(
  req: _LithiaRequest,
  lithia: Lithia,
): Promise<Route> {
  const routes = getRoutesFromManifest(lithia);
  const route = findMatchingRoute(req, routes, lithia.options._env);

  const validator = new DefaultRouteValidator();
  const validation = validator.validateRoute(route);

  if (!validation.isValid) {
    throw new InternalServerError(
      `Invalid route: ${validation.errors.join(', ')}`,
    );
  }

  return route;
}

/**
 * Imports and validates the route module
 */
async function importAndValidateModule(
  route: Route,
  lithia: Lithia,
): Promise<RouteModule> {
  const module = await importRouteModule(route, lithia.options._env);

  const validator = new DefaultRouteValidator();
  const validation = validator.validateModule(module);

  if (!validation.isValid) {
    throw new InternalServerError(
      `Invalid module: ${validation.errors.join(', ')}`,
    );
  }

  return module;
}

/**
 * Executes route-specific middlewares
 */
async function executeRouteMiddlewares(
  req: _LithiaRequest,
  res: _LithiaResponse,
  module: RouteModule,
): Promise<void> {
  await runMiddleware(module.middlewares || [], req, res);
}

/**
 * Executes the route handler
 */
async function executeRouteHandler(
  req: _LithiaRequest,
  res: _LithiaResponse,
  route: Route,
  module: RouteModule,
): Promise<void> {
  if (route.dynamic) {
    req.params = extractDynamicParams(req.pathname, route);
  }

  await executeHandler(module.default!, req, res);
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
function handleError(error: any, res: _LithiaResponse, isDev: boolean): void {
  const httpError = checkIsHttpError(error)
    ? error
    : new InternalServerError(
        isDev ? error.message : 'An internal server error occurred',
        isDev
          ? {
              stack: error.stack,
              originalError: error,
            }
          : undefined,
      );

  console.error(error);

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

function checkIsHttpError(error: any): error is HttpError {
  return error._isHttpError ? true : false;
}

async function runMiddleware(
  middlewares: LithiaMiddleware[],
  req: _LithiaRequest,
  res: _LithiaResponse,
): Promise<void> {
  const next = async (index: number): Promise<void> => {
    if (res._ended) return;
    if (index >= middlewares.length) return;

    const middleware = middlewares[index];
    if (typeof middleware !== 'function') {
      throw new InternalServerError('Middleware must be a function');
    }

    await middleware(req, res, async () => await next(index + 1));
  };

  await next(0);
}
