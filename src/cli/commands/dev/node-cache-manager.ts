import path from 'node:path';
import type { Lithia } from 'lithia/types';

/**
 * Node.js module cache manager for development.
 *
 * Responsible for clearing Node.js import cache for no-bundle mode.
 */
export class NodeCacheManager {
  private lithia: Lithia;

  constructor(lithia: Lithia) {
    this.lithia = lithia;
  }

  /**
   * Clears cache for all modules in the output directory.
   * Should be called after build to ensure changes are detected.
   */
  clearSrcModulesCache(): void {
    const outputDir = path.join(process.cwd(), this.lithia.options.outputDir);

    try {
      // Get all cached modules that are from output directory
      const outputModules = Object.keys(require.cache).filter((modulePath) =>
        modulePath.startsWith(outputDir),
      );

      // Clear each module and its dependencies
      outputModules.forEach((modulePath) => {
        delete require.cache[modulePath];

        // Also clear modules in the same directory (dependencies)
        const moduleDir = path.dirname(modulePath);
        Object.keys(require.cache).forEach((key) => {
          if (key.startsWith(moduleDir) && key !== modulePath) {
            delete require.cache[key];
          }
        });
      });

      if (this.lithia.options.logger.level === 'debug') {
        this.lithia.logger.debug(
          `Cache cleared: ${outputModules.length} modules removed`,
        );
      }
    } catch (error) {
      this.lithia.logger.error('Error clearing module cache:', error);
    }
  }
}
