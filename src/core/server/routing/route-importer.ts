import { pathToFileURL } from 'node:url';
import type { Route, RouteModule } from 'lithia/types';

/**
 * Handles dynamic import of route modules.
 *
 * Provides functionality to import route modules using standard dynamic imports.
 * Cache management is now handled by the NodeCacheManager after builds.
 */
export class RouteImporter {
  /**
   * Dynamically imports route module.
   * @param {Route} route - Route configuration
   * @returns {Promise<RouteModule>} Imported module
   *
   * @example
   * ```typescript
   * const importer = new RouteImporter();
   * const module = await importer.importRoute(route);
   * ```
   */
  async importRoute(route: Route): Promise<RouteModule> {
    try {
      return await import(pathToFileURL(route.filePath).href).then(
        (m) => m.default,
      );
    } catch (error) {
      throw new Error(
        `Failed to import route module ${route.filePath}: ${error.message}`,
      );
    }
  }

  /**
   * Checks if a route module can be imported.
   * @param {Route} route - Route configuration
   * @returns {Promise<boolean>} True if module can be imported
   */
  async canImportRoute(route: Route): Promise<boolean> {
    try {
      await this.importRoute(route);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Gets route module metadata.
   * @param {Route} route - Route configuration
   * @returns {Promise<any>} Route metadata
   */
  async getRouteMetadata(route: Route): Promise<any> {
    const module = await this.importRoute(route);
    return module.metadata;
  }
}
