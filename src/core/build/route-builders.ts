import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';
import esbuild from 'esbuild';
import { Route } from 'lithia/types';
import path from 'node:path';
import { getOutputPath } from '../_utils';
import { BuildContext } from './context';
import { RouteBuilder, RouteBuildError } from './route-builder';

/**
 * No-bundle route builder that compiles TypeScript without bundling dependencies.
 *
 * This builder compiles individual route files from TypeScript to JavaScript
 * while keeping all dependencies as external imports. This approach eliminates
 * duplicate bundling of common dependencies like Drizzle, Lodash, etc.
 *
 * @class
 * @implements {RouteBuilder}
 */
export class NoBundleRouteBuilder implements RouteBuilder {
  /**
   * Builds a single route file without bundling dependencies.
   *
   * Compiles TypeScript to JavaScript while keeping all dependencies external.
   * This prevents duplicate bundling of common libraries across routes.
   * Uses a single build for all files to handle relative imports properly.
   *
   * @param context - The build context containing configuration
   * @param route - The route to build
   * @throws {RouteBuildError} When route compilation fails
   */
  async buildRoute(context: BuildContext, route: Route): Promise<void> {
    // For no-bundle mode, we compile all TypeScript files at once
    // to handle relative imports between files properly
    // This is done only once per build, not per route
    if (!this.hasBuilt) {
      await this.buildAllFiles(context);
      this.hasBuilt = true;
    }

    // Suppress unused parameter warning - route is required by interface
    void route;
  }

  private hasBuilt = false;

  /**
   * Builds all TypeScript files in the src directory.
   *
   * @private
   * @param context - The build context containing configuration
   */
  private async buildAllFiles(context: BuildContext): Promise<void> {
    try {
      const srcDir = path.join(process.cwd(), context.lithia.options.srcDir);
      const outputDir = path.join(
        process.cwd(),
        context.lithia.options.outputDir,
      );

      await esbuild.build({
        entryPoints: [`${srcDir}/**/*.ts`],
        outdir: outputDir,
        platform: 'node',
        format: 'cjs',
        target: 'node18',
        bundle: false, // ← Key difference: no bundling
        sourcemap: context.config.sourcemap,
        minify: false, // Disable minification for no-bundle
        keepNames: true,
        plugins: [
          TsconfigPathsPlugin({
            tsconfig: path.join(process.cwd(), 'tsconfig.json'),
          }),
        ],
      });
    } catch (error) {
      throw new RouteBuildError(
        `Failed to build TypeScript files: ${error instanceof Error ? error.message : String(error)}`,
        { path: 'all', filePath: 'all' } as Route,
        error instanceof Error ? error : undefined,
      );
    }
  }
}

/**
 * Full bundle route builder that bundles everything (legacy behavior).
 *
 * This builder maintains the original bundling behavior for backward
 * compatibility. It bundles all dependencies into each route file.
 *
 * @class
 * @implements {RouteBuilder}
 */
export class FullBundleRouteBuilder implements RouteBuilder {
  /**
   * Builds a single route file with full bundling.
   *
   * Bundles all dependencies into the route file. This is the original
   * behavior and provides maximum compatibility but with duplicate bundling.
   *
   * @param context - The build context containing configuration
   * @param route - The route to build
   * @throws {RouteBuildError} When route compilation fails
   */
  async buildRoute(context: BuildContext, route: Route): Promise<void> {
    try {
      const outputDir = path.dirname(
        getOutputPath(context.lithia, route.filePath),
      );

      await esbuild.build({
        entryPoints: [route.filePath],
        outdir: outputDir,
        platform: 'node',
        format: 'cjs',
        target: 'node18',
        bundle: true,
        packages: 'external', // Only external packages from package.json
        sourcemap: context.config.sourcemap,
        minify: context.config.minify,
        keepNames: context.config.keepNames,
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
