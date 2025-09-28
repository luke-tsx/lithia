import path from 'node:path';
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';
import esbuild from 'esbuild';
import type { Route } from 'lithia/types';
import { getOutputPath } from '../_utils';
import type { BuildContext } from './context';

/**
 * Interface for route builder implementations.
 *
 * Implementations of this interface are responsible for building individual
 * route files using various build tools (esbuild, webpack, etc.).
 *
 * @interface
 */
export interface RouteBuilder {
  /**
   * Builds a single route file.
   *
   * @param context - The build context containing configuration
   * @param route - The route to build
   * @returns Promise that resolves when build is complete
   */
  buildRoute(context: BuildContext, route: Route): Promise<void>;
}

/**
 * Build error for route compilation failures.
 *
 * @class
 */
export class RouteBuildError extends Error {
  constructor(
    message: string,
    public readonly route: Route,
    public readonly originalError?: Error,
  ) {
    super(message);
    this.name = 'RouteBuildError';
  }
}

/**
 * Default implementation of RouteBuilder using esbuild.
 *
 * This builder compiles individual route files using esbuild with TypeScript
 * support, path mapping, and appropriate optimizations based on the build
 * environment.
 *
 * @class
 * @implements {RouteBuilder}
 */
export class EsbuildRouteBuilder implements RouteBuilder {
  /**
   * Builds a single route file using esbuild.
   *
   * Compiles the route file with appropriate settings for the build environment,
   * including TypeScript compilation, path resolution, and optimization.
   *
   * @param context - The build context containing configuration
   * @param route - The route to build
   * @throws {RouteBuildError} When route compilation fails
   */
  async buildRoute(context: BuildContext, route: Route): Promise<void> {
    try {
      const outputDir = path.dirname(getOutputPath(context.lithia, route.filePath));

      const { mode: _mode, ...esbuildConfig } = context.config;

      await esbuild.build({
        entryPoints: [route.filePath],
        outdir: outputDir,
        ...esbuildConfig,
        plugins: [
          TsconfigPathsPlugin({
            tsconfig: path.join(process.cwd(), 'tsconfig.json'),
          }),
        ],
        banner: {
          js: context.getRouteBanner(route),
        },
      });
    } catch (error) {
      throw new RouteBuildError(
        `Failed to build route ${route.path}: ${error instanceof Error ? error.message : String(error)}`,
        route,
        error instanceof Error ? error : undefined,
      );
    }
  }
}

/**
 * Parallel route builder that builds multiple routes concurrently.
 *
 * This builder wraps another RouteBuilder and provides parallel execution
 * capabilities for building multiple routes simultaneously.
 *
 * @class
 * @implements {RouteBuilder}
 */
export class ParallelRouteBuilder implements RouteBuilder {
  /**
   * Creates a new ParallelRouteBuilder instance.
   *
   * @param routeBuilder - The underlying route builder to use
   * @param concurrency - Maximum number of concurrent builds (default: 10)
   */
  constructor(
    private readonly routeBuilder: RouteBuilder,
    private readonly concurrency: number = 10,
  ) {}

  /**
   * Builds a single route file using the underlying builder.
   *
   * @param context - The build context containing configuration
   * @param route - The route to build
   * @returns Promise that resolves when build is complete
   */
  async buildRoute(context: BuildContext, route: Route): Promise<void> {
    return await this.routeBuilder.buildRoute(context, route);
  }

  /**
   * Builds multiple routes in parallel with controlled concurrency.
   *
   * @param context - The build context containing configuration
   * @param routes - Array of routes to build
   * @returns Promise that resolves when all builds are complete
   */
  async buildRoutes(context: BuildContext, routes: Route[]): Promise<void> {
    const chunks = this.chunkArray(routes, this.concurrency);

    for (const chunk of chunks) {
      await Promise.all(chunk.map((route) => this.buildRoute(context, route)));
    }
  }

  /**
   * Splits an array into chunks of specified size.
   *
   * @private
   * @param array - The array to chunk
   * @param chunkSize - The size of each chunk
   * @returns Array of chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
}
