import { FileInfo, Lithia, Route } from 'lithia/types';
import { DefaultRouteConvention } from './convention';
import { DefaultPathTransformer, PathTransformer } from './path-transformer';

/**
 * Interface for route processing implementations.
 *
 * Implementations of this interface are responsible for converting discovered
 * file information into Route objects that can be used by the routing system.
 *
 * @interface
 */
export interface RouteProcessor {
  /**
   * Processes a discovered file into a Route object.
   *
   * @param file - Information about the discovered file
   * @param lithia - The Lithia instance containing configuration
   * @returns A Route object representing the processed file
   */
  processFile(file: FileInfo, lithia: Lithia): Route;
}

/**
 * Default implementation of RouteProcessor that converts files to Route objects.
 *
 * This processor combines route conventions and path transformations to convert
 * file system paths into structured Route objects with proper HTTP methods,
 * environment suffixes, and regex patterns for route matching.
 *
 * @class
 * @implements {RouteProcessor}
 */
export class DefaultRouteProcessor implements RouteProcessor {
  private convention = new DefaultRouteConvention();
  private pathTransformer: PathTransformer;

  /**
   * Creates a new DefaultRouteProcessor instance.
   *
   * @param pathTransformer - Optional custom path transformer implementation
   */
  constructor(pathTransformer?: PathTransformer) {
    this.pathTransformer = pathTransformer || new DefaultPathTransformer();
  }

  /**
   * Processes a file into a Route object.
   *
   * This method applies route conventions to extract HTTP methods and environment
   * suffixes, transforms the file path into a route path, and generates the
   * necessary regex pattern for route matching.
   *
   * @param file - Information about the discovered file
   * @param lithia - The Lithia instance containing router configuration
   * @returns A complete Route object ready for use by the routing system
   */
  processFile(file: FileInfo, lithia: Lithia): Route {
    let path = this.convention.transformPath(file.path);
    path = this.pathTransformer.normalizePath(
      path,
      lithia.options.router.globalPrefix,
    );

    const { method, env, updatedPath } =
      this.convention.extractMethodAndEnv(path);
    path = updatedPath;

    path = this.pathTransformer.removeIndexSuffix(path);
    const filePath = file.fullPath;
    const dynamic = this.pathTransformer.isDynamicRoute(path);
    const regex = this.pathTransformer.generateRouteRegex(path);

    return {
      env,
      method,
      path,
      dynamic,
      filePath,
      regex,
    };
  }
}
