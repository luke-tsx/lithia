import { exec } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, writeFile, stat, readFile } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
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
  private fileTimestamps = new Map<string, number>();
  private swcConfig: Config | null = null;
  private cacheFile: string | null = null;

  /**
   * Loads persistent cache from disk to avoid unnecessary recompilation.
   *
   * @private
   */
  private async loadCache(): Promise<void> {
    if (!this.cacheFile) return;

    try {
      const cacheData = await readFile(this.cacheFile, 'utf-8');
      const cache = JSON.parse(cacheData);
      this.fileTimestamps = new Map(cache.timestamps || []);
    } catch {
      // Cache file doesn't exist or is invalid, start fresh
      this.fileTimestamps = new Map();
    }
  }

  /**
   * Saves persistent cache to disk for future builds.
   *
   * @private
   */
  private async saveCache(): Promise<void> {
    if (!this.cacheFile) return;

    try {
      const cacheData = {
        timestamps: Array.from(this.fileTimestamps.entries()),
        lastUpdated: Date.now(),
      };
      await writeFile(this.cacheFile, JSON.stringify(cacheData, null, 2));
    } catch {
      // Ignore cache save errors
    }
  }

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
      const projectRoot =
        (context.lithia.options._c12 as any)?.cwd || process.cwd();
      const srcDir = path.join(projectRoot, 'src');
      const outputDir = path.join(projectRoot, '.lithia');
      this.cacheFile = path.join(outputDir, '.lithia-cache.json');

      // Reuse SWC configuration if available
      if (!this.swcConfig) {
        this.swcConfig = {
          jsc: {
            parser: {
              syntax: 'typescript' as const,
              tsx: false,
              decorators: false,
            },
            target: 'esnext' as const,
            loose: false,
            externalHelpers: false,
            keepClassNames: true,
            minify: context.config.minify
              ? {
                  compress: true,
                  mangle: true,
                }
              : undefined,
          },
          module: {
            type: 'commonjs' as const,
            strict: true,
            lazy: false,
            importInterop: 'node',
          },
          sourceMaps: context.config.sourcemap,
        };
      }

      // Load persistent cache
      await this.loadCache();

      // Find all TypeScript files
      const files = await glob('**/*.{ts,tsx}', {
        cwd: srcDir,
        absolute: true,
        ignore: ['node_modules/**'],
      });

      // Create all output directories first
      const outputDirs = new Set<string>();
      files.forEach((filePath) => {
        const relativePath = path.relative(srcDir, filePath);
        const outputPath = path
          .join(outputDir, relativePath)
          .replace(/\.tsx?$/, '.js');
        outputDirs.add(path.dirname(outputPath));
      });

      await Promise.all(
        Array.from(outputDirs).map((dir) => mkdir(dir, { recursive: true })),
      );

      // Filter files that need to be recompiled (enhanced cache)
      const filesToCompile = await Promise.all(
        files.map(async (filePath) => {
          const relativePath = path.relative(srcDir, filePath);
          const outputPath = path
            .join(outputDir, relativePath)
            .replace(/\.tsx?$/, '.js');

          try {
            const sourceStats = await stat(filePath);
            const sourceMtime = sourceStats.mtime.getTime();

            // Check persistent cache first
            const cachedMtime = this.fileTimestamps.get(filePath);
            if (cachedMtime === sourceMtime) {
              // File hasn't changed since last build, check if output exists
              try {
                await stat(outputPath);
                return null; // Skip compilation
              } catch {
                // Output doesn't exist, need to compile
                return { filePath, outputPath, relativePath };
              }
            }

            // File changed or not in cache, check output timestamp
            try {
              const outputStats = await stat(outputPath);
              const outputMtime = outputStats.mtime.getTime();

              // Recompile if source file is newer than compiled file
              if (sourceMtime > outputMtime) {
                this.fileTimestamps.set(filePath, sourceMtime);
                return { filePath, outputPath, relativePath };
              }

              // Update cache even if no recompilation needed
              this.fileTimestamps.set(filePath, sourceMtime);
              return null;
            } catch {
              // Output doesn't exist, need to compile
              this.fileTimestamps.set(filePath, sourceMtime);
              return { filePath, outputPath, relativePath };
            }
          } catch {
            // If unable to read stats, compile for safety
            return { filePath, outputPath, relativePath };
          }
        }),
      );

      const filesToProcess = filesToCompile.filter(Boolean) as Array<{
        filePath: string;
        outputPath: string;
        relativePath: string;
      }>;

      // Process only files that need to be recompiled with dynamic batch size
      if (filesToProcess.length > 0) {
        // Dynamic batch size based on file count and system resources
        const batchSize = Math.min(
          Math.max(1, Math.floor(filesToProcess.length / 4)),
          20,
        );

        for (let i = 0; i < filesToProcess.length; i += batchSize) {
          const batch = filesToProcess.slice(i, i + batchSize);
          await Promise.all(
            batch.map(async ({ filePath, outputPath }) => {
              // Transform file
              const result = await transformFile(filePath, this.swcConfig!);

              // Write compiled file using streaming for better performance
              await new Promise<void>((resolve, reject) => {
                const writeStream = createWriteStream(outputPath);
                writeStream.write(result.code);
                writeStream.end();
                writeStream.on('finish', resolve);
                writeStream.on('error', reject);
              });

              // Write sourcemap if enabled
              if (result.map && context.config.sourcemap) {
                await new Promise<void>((resolve, reject) => {
                  const mapStream = createWriteStream(`${outputPath}.map`);
                  mapStream.write(result.map);
                  mapStream.end();
                  mapStream.on('finish', resolve);
                  mapStream.on('error', reject);
                });
              }
            }),
          );
        }

        // Save cache after successful compilation
        await this.saveCache();
      }

      // Resolve TypeScript path mappings with tsc-alias only if necessary
      // Run tsc-alias in parallel with compilation for better performance
      if (filesToProcess.length > 0) {
        const execAsync = promisify(exec);

        // Start tsc-alias asynchronously (don't await yet)
        const tscAliasPromise = execAsync(
          `npx tsc-alias --project ${path.join(projectRoot, 'tsconfig.json')} --outDir ${outputDir}`,
          {
            cwd: projectRoot,
          },
        );

        // Wait for tsc-alias to complete
        await tscAliasPromise;
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
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
      const projectRoot =
        (context.lithia.options._c12 as any)?.cwd || process.cwd();
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
