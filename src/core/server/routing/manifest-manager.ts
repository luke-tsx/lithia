import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Lithia, Route } from 'lithia/types';
import { getOutputPath } from '../../_utils';

/**
 * Manages routes manifest file operations.
 *
 * Handles creation, reading, and updating of the routes.json manifest file
 * that contains all registered routes with their metadata.
 */
export class ManifestManager {
  private lithia: Lithia;

  constructor(lithia: Lithia) {
    this.lithia = lithia;
  }

  /**
   * Creates a routes manifest file by writing the provided routes to a JSON file.
   * @param {Route[]} routes - An array of Route objects to include in the manifest.
   */
  async createManifest(routes: Route[]): Promise<void> {
    const updatedRoutes = this.updateFilePaths(routes);
    await this.writeRoutesToFile(updatedRoutes);
  }

  /**
   * Reads the routes manifest file and parses it into an array of Route objects.
   * @returns {Route[]} - An array of Route objects parsed from the manifest file.
   */
  getRoutesFromManifest(): Route[] {
    const manifestPath = this.getManifestFilePath();
    const manifestContent = readFileSync(manifestPath, 'utf-8');
    return this.parseRoutesFromManifest(manifestContent);
  }

  /**
   * Gets the path to the routes manifest file.
   * @returns {string} - The absolute path to the routes manifest file.
   */
  getManifestFilePath(): string {
    return path.join(process.cwd(), '.lithia', 'routes.json');
  }

  /**
   * Checks if the routes manifest file exists.
   * @returns {boolean} - True if the manifest file exists.
   */
  manifestExists(): boolean {
    try {
      const manifestPath = this.getManifestFilePath();
      readFileSync(manifestPath, 'utf-8');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Updates the `filePath` property of each route to reflect the output path.
   * Preserves the `sourceFilePath` as the original TypeScript file path.
   * @private
   * @param {Route[]} routes - An array of Route objects to process.
   * @returns {Route[]} - An array of Route objects with updated `filePath` properties.
   */
  private updateFilePaths(routes: Route[]): Route[] {
    return routes.map((route) => ({
      ...route,
      filePath: getOutputPath(this.lithia, route.filePath),
      sourceFilePath: route.sourceFilePath || route.filePath,
    }));
  }

  /**
   * Writes the routes array to a JSON file in the specified output directory.
   * @private
   * @param {Route[]} routes - An array of Route objects to write to the file.
   */
  private async writeRoutesToFile(routes: Route[]): Promise<void> {
    const outputPath = path.join('.lithia', 'routes.json');
    await writeFile(outputPath, JSON.stringify(routes, null, 2));
  }

  /**
   * Parses the content of the routes manifest file into an array of Route objects.
   * @private
   * @param {string} manifestContent - The raw content of the routes manifest file.
   * @returns {Route[]} - An array of Route objects parsed from the manifest content.
   */
  private parseRoutesFromManifest(manifestContent: string): Route[] {
    try {
      return JSON.parse(manifestContent);
    } catch (error) {
      throw new Error(`Failed to parse routes manifest: ${error.message}`);
    }
  }
}
