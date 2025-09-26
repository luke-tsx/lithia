import { MatchedEnvSuffix, MatchedMethodSuffix } from 'lithia/types';

/**
 * Interface for route convention implementations.
 *
 * Implementations of this interface define how file names and paths are
 * interpreted to extract HTTP methods, environment suffixes, and transform
 * file system paths into route paths.
 *
 * @interface
 */
export interface RouteConvention {
  /**
   * Extracts HTTP method from a filename.
   *
   * @param filename - The filename to analyze
   * @returns The HTTP method found in the filename, or undefined if none
   */
  getMethodFromFilename(filename: string): MatchedMethodSuffix | undefined;

  /**
   * Extracts environment suffix from a filename.
   *
   * @param filename - The filename to analyze
   * @returns The environment suffix found in the filename, or undefined if none
   */
  getEnvFromFilename(filename: string): MatchedEnvSuffix | undefined;

  /**
   * Transforms a file path into a route path.
   *
   * @param path - The file path to transform
   * @returns The transformed route path
   */
  transformPath(path: string): string;

  /**
   * Extracts method and environment information from a path.
   *
   * @param path - The path to analyze
   * @returns Object containing method, environment, and cleaned path
   */
  extractMethodAndEnv(path: string): {
    method: MatchedMethodSuffix | undefined;
    env: MatchedEnvSuffix | undefined;
    updatedPath: string;
  };
}

/**
 * Default implementation of RouteConvention that follows file-based routing conventions.
 *
 * This convention supports:
 * - HTTP method suffixes (e.g., `.get.ts`, `.post.ts`)
 * - Environment suffixes (e.g., `.dev.ts`, `.prod.ts`)
 * - Dynamic segments with brackets (e.g., `[id].ts`)
 * - Catch-all routes (e.g., `[...slug].ts`)
 * - Optional route groups (e.g., `(auth)/profile.ts`)
 *
 * @class
 * @implements {RouteConvention}
 */
export class DefaultRouteConvention implements RouteConvention {
  private readonly suffixRegex =
    /(\.(?<method>connect|delete|get|head|options|patch|post|put|trace))?(\.(?<env>dev|prod))?$/;

  /**
   * Extracts HTTP method from a filename using suffix patterns.
   *
   * Supports standard HTTP methods as filename suffixes:
   * - `.get.ts`, `.post.ts`, `.put.ts`, etc.
   *
   * @param filename - The filename to analyze
   * @returns The HTTP method in uppercase, or undefined if not found
   */
  getMethodFromFilename(filename: string): MatchedMethodSuffix | undefined {
    const match = filename.match(this.suffixRegex);
    return match?.groups?.method?.toUpperCase() as
      | MatchedMethodSuffix
      | undefined;
  }

  /**
   * Extracts environment suffix from a filename.
   *
   * Supports environment-specific files:
   * - `.dev.ts` for development-only routes
   * - `.prod.ts` for production-only routes
   *
   * @param filename - The filename to analyze
   * @returns The environment suffix, or undefined if not found
   */
  getEnvFromFilename(filename: string): MatchedEnvSuffix | undefined {
    const match = filename.match(this.suffixRegex);
    return match?.groups?.env as MatchedEnvSuffix | undefined;
  }

  /**
   * Transforms a file path into a route path following conventions.
   *
   * Applies the following transformations:
   * - Removes file extensions
   * - Removes optional route groups (parentheses)
   * - Converts dynamic segments ([param] -> :param)
   * - Converts catch-all segments ([...param] -> **:param)
   * - Normalizes path separators
   *
   * @param path - The file path to transform
   * @returns The transformed route path
   */
  transformPath(path: string): string {
    return path
      .replace(/\.[A-Za-z]+$/, '')
      .replace(/\(([^(/\\]+)\)[/\\]/g, '')
      .replace(/\[\.{3}]/g, '**')
      .replace(/\[\.{3}(\w+)]/g, '**:$1')
      .replace(/\[([^/\]]+)]/g, ':$1')
      .replace(/\\/g, '/');
  }

  /**
   * Extracts method and environment information from a path.
   *
   * Analyzes the path for HTTP method and environment suffixes, removes them
   * from the path, and returns the extracted information along with the cleaned path.
   *
   * @param path - The path to analyze
   * @returns Object containing:
   *   - method: The HTTP method found in the path
   *   - env: The environment suffix found in the path
   *   - updatedPath: The path with suffixes removed
   */
  extractMethodAndEnv(path: string): {
    method: MatchedMethodSuffix | undefined;
    env: MatchedEnvSuffix | undefined;
    updatedPath: string;
  } {
    const suffixMatch = path.match(this.suffixRegex);
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
}
