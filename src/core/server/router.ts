import { Lithia, Metadata, Route, RouteModule } from 'lithia/types';
import { readFileSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { getOutputPath } from '../_utils';

/**
 * Creates a routes manifest file by writing the provided routes to a JSON file.
 * @param {Lithia} lithia - The Lithia instance containing configuration options.
 * @param {Route[]} routes - An array of Route objects to include in the manifest.
 */
export async function createRoutesManifest(
  lithia: Lithia,
  routes: Route[],
): Promise<void> {
  const updatedRoutes = updateFilePaths(lithia, routes);
  await writeRoutesToFile(lithia, updatedRoutes);
}

/**
 * Updates the `filePath` property of each route to reflect the output path.
 * @param {Lithia} lithia - The Lithia instance containing configuration options.
 * @param {Route[]} routes - An array of Route objects to process.
 * @returns {Route[]} - An array of Route objects with updated `filePath` properties.
 */
function updateFilePaths(lithia: Lithia, routes: Route[]): Route[] {
  return routes.map((route) => ({
    ...route,
    filePath: getOutputPath(lithia, route.filePath),
  }));
}

/**
 * Writes the routes array to a JSON file in the specified output directory.
 * @param {Lithia} lithia - The Lithia instance containing configuration options.
 * @param {Route[]} routes - An array of Route objects to write to the file.
 */
async function writeRoutesToFile(
  lithia: Lithia,
  routes: Route[],
): Promise<void> {
  const outputPath = path.join(lithia.options.outputDir, 'routes.json');
  await writeFile(outputPath, JSON.stringify(routes, null, 2));
}

/**
 * Reads the routes manifest file and parses it into an array of Route objects.
 * @param {Lithia} lithia - The Lithia instance containing configuration options.
 * @returns {Route[]} - An array of Route objects parsed from the manifest file.
 */
export function getRoutesFromManifest(lithia: Lithia): Route[] {
  const manifestPath = getManifestFilePath(lithia);
  const manifestContent = readFileSync(manifestPath, 'utf-8');
  return parseRoutesFromManifest(manifestContent);
}

/**
 * Constructs the full path to the routes manifest file.
 * @param {Lithia} lithia - The Lithia instance containing configuration options.
 * @returns {string} - The absolute path to the routes manifest file.
 */
function getManifestFilePath(lithia: Lithia): string {
  return path.join(process.cwd(), lithia.options.outputDir, 'routes.json');
}

/**
 * Parses the content of the routes manifest file into an array of Route objects.
 * @param {string} manifestContent - The raw content of the routes manifest file.
 * @returns {Route[]} - An array of Route objects parsed from the manifest content.
 */
function parseRoutesFromManifest(manifestContent: string): Route[] {
  return JSON.parse(manifestContent);
}

/**
 * Dynamically imports route module with cache control
 * @async
 * @param {RouteModule} route - Route configuration
 * @param {string} env - Current environment
 * @returns {Promise<RouteModule>} Imported module
 */
export async function importRouteModule(
  route: Route,
  env: string,
): Promise<RouteModule> {
  const cacheBuster = env === 'dev' ? `?updated=${Date.now()}` : '';
  return import(`${pathToFileURL(route.filePath).href}${cacheBuster}`);
}

export async function getRouteMetadata(
  lithia: Lithia,
  route: Route,
): Promise<Metadata | undefined> {
  return importRouteModule(route, lithia.options._env).then(
    (module) => module.metadata,
  );
}

/**
 * Extracts dynamic parameters from request path
 * @param {_LithiaRequest} req - Request object
 * @param {RouteModule} route - Matched route
 */
export function extractDynamicParams(pathname: string, route: Route) {
  const matches = pathname.match(new RegExp(route.regex)) || [];
  const paramNames = (route.path.match(/:([^/]+)/g) || []).map((p) =>
    p.slice(1),
  );

  return paramNames.reduce(
    (acc, name, index) => ({
      ...acc,
      [name]: matches[index + 1],
    }),
    {},
  );
}
