import type { RouteBuilder } from './route-builder';
import { FullBundleRouteBuilder, NoBundleRouteBuilder } from './route-builders';

/**
 * Build mode types for different bundling strategies.
 *
 * @type
 */
export type BuildMode = 'no-bundle' | 'full-bundle';

/**
 * Build mode configuration options.
 *
 * @interface
 */
export interface BuildModeConfig {
  /** The build mode to use */
  mode: BuildMode;
  /** Custom external packages (for future use) */
  externalPackages?: string[];
}

/**
 * Factory for creating route builders based on build mode.
 *
 * This factory creates appropriate RouteBuilder implementations based on
 * the selected build mode, allowing easy switching between different
 * bundling strategies.
 *
 * @class
 */
export class BuildModeFactory {
  /**
   * Creates a RouteBuilder instance based on the build mode.
   *
   * @param mode - The build mode to use
   * @param externalPackages - Custom external packages (for future use)
   * @returns RouteBuilder instance for the specified mode
   *
   * @example
   * ```typescript
   * // No-bundle mode (fastest builds, no duplicate dependencies)
   * const noBundleBuilder = BuildModeFactory.createBuilder('no-bundle');
   *
   * // Full-bundle mode (original behavior, maximum compatibility)
   * const fullBundleBuilder = BuildModeFactory.createBuilder('full-bundle');
   * ```
   */
  static createBuilder(mode: BuildMode): RouteBuilder {
    switch (mode) {
      case 'no-bundle':
        return new NoBundleRouteBuilder();

      case 'full-bundle':
        return new FullBundleRouteBuilder();

      default:
        throw new Error(`Unknown build mode: ${mode}`);
    }
  }

  /**
   * Gets build mode recommendations based on project characteristics.
   *
   * @param routeCount - Number of routes in the project
   * @param hasLargeDeps - Whether the project uses large dependencies
   * @returns Recommended build mode and configuration
   *
   * @example
   * ```typescript
   * const recommendation = BuildModeFactory.getRecommendation(100, true);
   * // Returns: { mode: 'no-bundle', reason: 'High route count with large dependencies' }
   * ```
   */
  static getRecommendation(
    routeCount: number,
    hasLargeDeps: boolean,
  ): { mode: BuildMode; reason: string } {
    if (routeCount > 20 || hasLargeDeps) {
      return {
        mode: 'no-bundle',
        reason:
          'Medium/high route count or large dependencies - no-bundle prevents duplicate bundling',
      };
    }

    return {
      mode: 'full-bundle',
      reason:
        'Low route count and small dependencies - full bundling provides maximum compatibility',
    };
  }

  /**
   * Gets performance characteristics of each build mode.
   *
   * @returns Object describing performance characteristics of each mode
   */
  static getPerformanceCharacteristics(): Record<
    BuildMode,
    {
      buildSpeed: 'fast' | 'medium' | 'slow';
      bundleSize: 'small' | 'medium' | 'large';
      duplicateDeps: boolean;
      compatibility: 'high' | 'medium' | 'low';
      description: string;
    }
  > {
    return {
      'no-bundle': {
        buildSpeed: 'fast',
        bundleSize: 'small',
        duplicateDeps: false,
        compatibility: 'medium',
        description:
          'Fastest builds, no duplicate dependencies, requires Node.js dependency resolution',
      },
      'full-bundle': {
        buildSpeed: 'slow',
        bundleSize: 'large',
        duplicateDeps: true,
        compatibility: 'high',
        description:
          'Maximum compatibility, bundles everything, may duplicate large dependencies',
      },
    };
  }
}
