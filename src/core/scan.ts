import { globby } from 'globby';
import {
  FileInfo,
  Lithia,
  MatchedEnvSuffix,
  MatchedMethodSuffix,
  Route,
} from 'lithia/types';
import nodePath from 'node:path';
import { withBase, withLeadingSlash, withoutTrailingSlash } from 'ufo';

const suffixRegex =
  /(\.(?<method>connect|delete|get|head|options|patch|post|put|trace))?(\.(?<env>dev|prod))?$/;

/**
 * Scans server routes based on the provided Lithia configuration.
 * @param {Lithia} lithia - The Lithia instance containing configuration options.
 * @returns {Promise<Route[]>} - A promise resolving to an array of Route objects.
 */
export async function scanServerRoutes(lithia: Lithia): Promise<Route[]> {
  const files = await scanDirectory(lithia);
  return files.map((file) => processFile(file, lithia));
}

/**
 * Scans a directory for TypeScript files matching the specified pattern.
 * @param {Lithia} lithia - The Lithia instance containing configuration options.
 * @returns {Promise<FileInfo[]>} - A promise resolving to an array of FileInfo objects.
 */
async function scanDirectory(lithia: Lithia): Promise<FileInfo[]> {
  const dir = process.cwd();
  const name = nodePath.resolve(
    dir,
    lithia.options.srcDir,
    lithia.options.routesDir,
  );
  return scanDir({
    dir,
    name,
    ignore: ['**/*.{spec,test}.ts'],
  });
}

/**
 * Processes a single file to extract route information.
 * @param {FileInfo} file - The file information object.
 * @param {Lithia} lithia - The Lithia instance containing configuration options.
 * @returns {Route} - A Route object representing the processed file.
 */
function processFile(file: FileInfo, lithia: Lithia): Route {
  let path = transformFilePath(file.path);
  path = normalizePath(path, lithia.options.router.globalPrefix);

  const { method, env, updatedPath } = extractMethodAndEnv(path);
  path = updatedPath;

  path = removeIndexSuffix(path);
  const filePath = file.fullPath;
  const dynamic = isDynamicRoute(path);
  const regex = generateRouteRegex(path);

  return {
    env,
    method,
    path,
    dynamic,
    filePath,
    regex,
  };
}

/**
 * Transforms a file path into a route path by applying specific rules.
 * @param {string} path - The original file path.
 * @returns {string} - The transformed route path.
 */
function transformFilePath(path: string): string {
  return path
    .replace(/\.[A-Za-z]+$/, '')
    .replace(/\(([^(/\\]+)\)[/\\]/g, '')
    .replace(/\[\.{3}]/g, '**')
    .replace(/\[\.{3}(\w+)]/g, '**:$1')
    .replace(/\[([^/\]]+)]/g, ':$1')
    .replace(/\\/g, '/');
}

/**
 * Normalizes a route path by adding a leading slash and removing trailing slashes.
 * @param {string} path - The route path to normalize.
 * @param {string} globalPrefix - The global prefix for the router.
 * @returns {string} - The normalized route path.
 */
function normalizePath(path: string, globalPrefix: string): string {
  return withLeadingSlash(withoutTrailingSlash(withBase(path, globalPrefix)));
}

/**
 * Extracts HTTP method and environment suffixes from a route path.
 * @param {string} path - The route path to analyze.
 * @returns {{ method: MatchedMethodSuffix | undefined, env: MatchedEnvSuffix | undefined, updatedPath: string }} - An object containing the extracted method, environment, and updated path.
 */
function extractMethodAndEnv(path: string): {
  method: MatchedMethodSuffix | undefined;
  env: MatchedEnvSuffix | undefined;
  updatedPath: string;
} {
  const suffixMatch = path.match(suffixRegex);
  let method: MatchedMethodSuffix | undefined;
  let env: MatchedEnvSuffix | undefined;

  if (suffixMatch?.index && suffixMatch?.index >= 0) {
    path = path.slice(0, suffixMatch.index);
    method = suffixMatch.groups?.method?.toUpperCase() as
      | MatchedMethodSuffix
      | undefined;
    env = suffixMatch.groups?.env as MatchedEnvSuffix | undefined;
  }

  return { method, env, updatedPath: path };
}

/**
 * Removes the `/index` suffix from a route path if present.
 * @param {string} path - The route path to process.
 * @returns {string} - The route path without the `/index` suffix.
 */
function removeIndexSuffix(path: string): string {
  return path.replace(/\/index$/, '') || '/';
}

/**
 * Checks if a route path is dynamic (contains parameters).
 * @param {string} path - The route path to check.
 * @returns {boolean} - True if the route path is dynamic, false otherwise.
 */
function isDynamicRoute(path: string): boolean {
  return path.includes(':');
}

/**
 * Generates a regular expression for matching route paths.
 * @param {string} path - The route path to generate a regex for.
 * @returns {string} - The source of the generated regular expression.
 */
function generateRouteRegex(path: string): string {
  const namedRegex = path.replace(/:(\w+)/g, (_, key) => `:${key}`);
  return new RegExp(
    `^${namedRegex.replace(/\//g, '\\/').replace(/:\w+/g, '([^\\/]+)')}$`,
  ).source;
}

/**
 * Scans a directory for files matching a specific pattern.
 * @param {ScanDirOptions} options - Options for scanning the directory.
 * @returns {Promise<FileInfo[]>} - A promise resolving to an array of FileInfo objects.
 */
async function scanDir(options: ScanDirOptions): Promise<FileInfo[]> {
  const normalizedName = options.name.replace(/\\/g, '/');
  const pattern = `${normalizedName}/**/*.ts`;
  const fileNames = await globby(pattern, {
    cwd: options.dir,
    dot: true,
    ignore: options.ignore,
    absolute: true,
  });

  return fileNames
    .map((fullPath) => {
      const path = nodePath.relative(normalizedName, fullPath);
      return {
        fullPath,
        path,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}

type ScanDirOptions = {
  dir: string;
  name: string;
  ignore?: string[];
};
