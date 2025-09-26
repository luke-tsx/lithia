import { Lithia, Route, RouteModule } from 'lithia/types';
import { InternalServerError, NotFoundError } from './errors';
import { MiddlewareManager } from './middleware-manager';
import { _LithiaRequest } from './request';
import { _LithiaResponse } from './response';
import { RouterManager } from './routing';
import { DefaultRouteValidator } from './validation';

/**
 * RequestProcessor handles the complete request processing pipeline.
 * Manages route finding, validation, middleware execution, and handler execution.
 */
export class RequestProcessor {
  constructor(
    private lithia: Lithia,
    private routerManager: RouterManager,
    private middlewareManager: MiddlewareManager,
  ) {}

  /**
   * Processes incoming HTTP request through the complete pipeline.
   *
   * @param req - Request object
   * @param res - Response object
   */
  async processRequest(
    req: _LithiaRequest,
    res: _LithiaResponse,
  ): Promise<void> {
    try {
      await this.lithia.hooks
        .callHook('request:before', req, res)
        .catch((error) => {
          this.lithia.logger.error('Error in request:before hook:', error);
        });

      await this.executeGlobalMiddlewares(req, res);

      if (res._ended) return;

      const route = await this.findAndValidateRoute(req);
      const module = await this.importAndValidateModule(route);

      await this.executeRouteMiddlewares(req, res, route, module);

      if (res._ended) return;

      await this.executeRouteHandler(req, res, route, module);
    } catch (error) {
      await this.lithia.hooks.callHook('request:error', req, res, error);
      throw error;
    } finally {
      await this.lithia.hooks
        .callHook('request:after', req, res)
        .catch((error) => {
          this.lithia.logger.error('Error in request:after hook:', error);
        });
    }
  }

  /**
   * Executes global middlewares.
   *
   * @param req - Request object
   * @param res - Response object
   */
  private async executeGlobalMiddlewares(
    req: _LithiaRequest,
    res: _LithiaResponse,
  ): Promise<void> {
    res.addHeader('X-Powered-By', 'Lithia');
    await this.middlewareManager.executeGlobalMiddlewares(
      this.lithia.options.globalMiddlewares,
      req,
      res,
    );
  }

  /**
   * Finds and validates the matching route.
   *
   * @param req - Request object
   * @returns Validated route
   */
  private async findAndValidateRoute(req: _LithiaRequest): Promise<Route> {
    const route = await this.findMatchingRoute(req);
    return this.validateRoute(route);
  }

  /**
   * Finds matching route for current request.
   *
   * @param req - Request object
   * @returns Matched route
   */
  private async findMatchingRoute(req: _LithiaRequest): Promise<Route> {
    const route = await this.routerManager.findRoute(req.pathname, req.method);

    if (!route) {
      throw new NotFoundError('No matching routes');
    }

    return route;
  }

  /**
   * Validates route configuration.
   *
   * @param route - Route to validate
   * @returns Validated route
   */
  private validateRoute(route: Route): Route {
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
   * Imports and validates the route module.
   *
   * @param route - Route configuration
   * @returns Validated module
   */
  private async importAndValidateModule(route: Route): Promise<RouteModule> {
    const module = await this.routerManager.importRouteModule(route);
    return this.validateModule(module);
  }

  /**
   * Validates route module.
   *
   * @param module - Module to validate
   * @returns Validated module
   */
  private validateModule(module: RouteModule): RouteModule {
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
   * Executes route-specific middlewares.
   *
   * @param req - Request object
   * @param res - Response object
   * @param route - Route information
   * @param module - Route module
   */
  private async executeRouteMiddlewares(
    req: _LithiaRequest,
    res: _LithiaResponse,
    route: Route,
    module: RouteModule,
  ): Promise<void> {
    const routeInfo = {
      path: route.path,
      method: route.method || req.method,
      dynamic: route.dynamic,
    };

    await this.middlewareManager.executeRouteMiddlewares(
      module.middlewares || [],
      req,
      res,
      routeInfo,
    );
  }

  /**
   * Executes the route handler.
   *
   * @param req - Request object
   * @param res - Response object
   * @param route - Route configuration
   * @param module - Route module
   */
  private async executeRouteHandler(
    req: _LithiaRequest,
    res: _LithiaResponse,
    route: Route,
    module: RouteModule,
  ): Promise<void> {
    if (route.dynamic) {
      req.params = this.routerManager.extractParams(req.pathname, route);
    }

    await module.default!(req, res);
    if (!res._ended) res.end();
  }
}
