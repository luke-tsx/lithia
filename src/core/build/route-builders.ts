import { execSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';
import type { Config } from '@swc/core';
import { transformFile } from '@swc/core';
import esbuild from 'esbuild';
import { glob } from 'glob';
import type { Route } from 'lithia/types';
import { getOutputPath } from '../_utils';
import type { BuildContext } from './context';
import { RouteBuildError, type RouteBuilder } from './route-builder';

/**
 * No-bundle route builder that compiles TypeScript using SWC (Speedy Web Compiler).
 *
 * This builder uses SWC instead of esbuild for no-bundle mode because SWC is
 * much faster than tsc and can properly resolve TypeScript path mappings
 * (@/middlewares/auth). This approach eliminates duplicate bundling while
 * maintaining proper module resolution.
 *
 * @class
 * @implements {RouteBuilder}
 */
export class NoBundleRouteBuilder implements RouteBuilder {
  /**
   * Builds a single route file without bundling dependencies.
   *
   * Uses SWC to compile all TypeScript files at once, which allows proper
   * resolution of TypeScript path mappings. This prevents duplicate bundling
   * of common libraries while maintaining correct module resolution.
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
   * Builds all TypeScript files using SWC (Speedy Web Compiler).
   *
   * Uses SWC instead of esbuild for no-bundle mode because SWC is much faster
   * than tsc and can properly resolve TypeScript path mappings (@/middlewares/auth).
   * This approach eliminates duplicate bundling while maintaining proper module resolution.
   *
   * @private
   * @param context - The build context containing configuration
   */
  private async buildAllFiles(context: BuildContext): Promise<void> {
    try {
      const projectRoot = (context.lithia.options._c12 as any)?.cwd || process.cwd();
      const srcDir = path.join(projectRoot, 'src');
      const outputDir = path.join(projectRoot, '.lithia');

      // Configuração inline do SWC
      const swcOptions: Config = {
        jsc: {
          parser: {
            syntax: 'typescript' as const,
            tsx: false,
            decorators: false,
          },
          target: 'esnext' as const,
          loose: false,
          externalHelpers: true,
          keepClassNames: true,
          minify: {
            compress: true,
            mangle: true,
          },
        },
        module: {
          type: 'commonjs' as const,
          strict: true,
          strictMode: true,
          lazy: false,
          importInterop: 'node',
        },
        sourceMaps: true,
      };

      // Encontrar todos os arquivos TypeScript
      const files = await glob('**/*.{ts,tsx}', {
        cwd: srcDir,
        absolute: true,
        ignore: ['node_modules/**'],
      });

      // Processar cada arquivo
      await Promise.all(
        files.map(async (filePath) => {
          const relativePath = path.relative(srcDir, filePath);
          const outputPath = path.join(outputDir, relativePath).replace(/\.tsx?$/, '.js');

          // Criar diretório de saída
          await mkdir(path.dirname(outputPath), { recursive: true });

          // Transformar arquivo
          const result = await transformFile(filePath, swcOptions);

          // Escrever arquivo compilado
          await writeFile(outputPath, result.code);

          // Escrever sourcemap se habilitado
          if (result.map && context.config.sourcemap) {
            await writeFile(`${outputPath}.map`, result.map);
          }
        }),
      );

      // Resolver TypeScript path mappings com tsc-alias
      execSync(`npx tsc-alias --project ${path.join(projectRoot, 'tsconfig.json')} --outDir ${outputDir}`, {
        cwd: projectRoot,
        stdio: 'pipe',
        encoding: 'utf8',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new RouteBuildError(
        `Failed to build TypeScript files with SWC: ${errorMessage}`,
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
      const projectRoot = (context.lithia.options._c12 as any)?.cwd || process.cwd();
      const outputDir = path.dirname(getOutputPath(context.lithia, route.filePath));

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
            tsconfig: path.join(projectRoot, 'tsconfig.json'),
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
