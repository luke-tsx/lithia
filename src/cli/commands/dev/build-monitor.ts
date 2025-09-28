import { buildLithia, prepare } from 'lithia/core';
import type { Lithia } from 'lithia/types';
import { DevServerEventEmitter, DevServerEventType } from './events';
import { NodeCacheManager } from './node-cache-manager';

/**
 * Build statistics for monitoring.
 */
export interface BuildStats {
  /** Total number of builds performed */
  totalBuilds: number;
  /** Number of successful builds */
  successfulBuilds: number;
  /** Number of failed builds */
  failedBuilds: number;
  /** Average build time in milliseconds */
  averageBuildTime: number;
  /** Last build time in milliseconds */
  lastBuildTime: number;
  /** Last build timestamp */
  lastBuildTimestamp: number;
}

/**
 * Build monitor for development server.
 *
 * Manages build operations and provides statistics about
 * build performance and success rates.
 */
export class BuildMonitor {
  private eventEmitter: DevServerEventEmitter;
  private lithia: Lithia;
  private stats: BuildStats;
  private isBuilding = false;
  private buildQueue: Array<() => Promise<void>> = [];
  private processingQueue = false;
  private cacheManager: NodeCacheManager;

  constructor(eventEmitter: DevServerEventEmitter, lithia: Lithia) {
    this.eventEmitter = eventEmitter;
    this.lithia = lithia;
    this.cacheManager = new NodeCacheManager(lithia);
    this.stats = {
      totalBuilds: 0,
      successfulBuilds: 0,
      failedBuilds: 0,
      averageBuildTime: 0,
      lastBuildTime: 0,
      lastBuildTimestamp: 0,
    };
  }

  /**
   * Trigger a build operation.
   *
   * @param reason - Reason for the build (for logging)
   */
  async build(reason = 'Manual build'): Promise<boolean> {
    return new Promise((resolve) => {
      this.buildQueue.push(async () => {
        const result = await this.performBuild(reason);
        resolve(result);
      });

      this.processQueue();
    });
  }

  /**
   * Check if a build is currently in progress.
   */
  get building(): boolean {
    return this.isBuilding;
  }

  /**
   * Get current build statistics.
   */
  getStatistics(): BuildStats {
    return { ...this.stats };
  }

  /**
   * Reset build statistics.
   */
  resetStatistics(): void {
    this.stats = {
      totalBuilds: 0,
      successfulBuilds: 0,
      failedBuilds: 0,
      averageBuildTime: 0,
      lastBuildTime: 0,
      lastBuildTimestamp: 0,
    };
  }

  /**
   * Perform the actual build operation.
   *
   * @private
   * @param reason - Reason for the build
   * @returns Whether the build was successful
   */
  private async performBuild(reason: string): Promise<boolean> {
    if (this.isBuilding) {
      return false;
    }

    this.isBuilding = true;
    const startTime = Date.now();

    try {
      await this.eventEmitter.emit(DevServerEventType.BUILD_STARTING, {
        reason,
        timestamp: startTime,
      });

      this.lithia.logger.wait('Building project...');

      // Prepare and build
      await prepare();
      const result = await buildLithia(this.lithia);

      const buildTime = Date.now() - startTime;
      this.updateStats(buildTime, result.success);

      if (result.success) {
        this.cacheManager.clearOutputModulesCache();

        await this.eventEmitter.emit(DevServerEventType.BUILD_SUCCESS, {
          buildTime,
          routesBuilt: result.routesBuilt,
          reason,
        });

        this.lithia.logger.success(
          `Build completed successfully in ${buildTime}ms`,
        );
        this.lithia.logger.info(`Routes built: ${result.routesBuilt}`);
      } else {
        await this.eventEmitter.emit(DevServerEventType.BUILD_ERROR, {
          buildTime,
          errors: result.errors,
          reason,
        });

        this.lithia.logger.error(`Build failed in ${buildTime}ms`);
        result.errors.forEach((error) => {
          this.lithia.logger.error(`  - ${error.message}`);
        });
      }

      await this.eventEmitter.emit(DevServerEventType.BUILD_COMPLETE, {
        buildTime,
        success: result.success,
        routesBuilt: result.routesBuilt,
        reason,
      });

      return result.success;
    } catch (error) {
      const buildTime = Date.now() - startTime;
      this.updateStats(buildTime, false);

      await this.eventEmitter.emit(DevServerEventType.BUILD_ERROR, {
        buildTime,
        error,
        reason,
      });

      this.lithia.logger.error(
        `Build failed with error in ${buildTime}ms:`,
        error,
      );
      return false;
    } finally {
      this.isBuilding = false;
    }
  }

  /**
   * Process the build queue.
   *
   * @private
   */
  private async processQueue(): Promise<void> {
    if (this.processingQueue || this.buildQueue.length === 0) {
      return;
    }

    this.processingQueue = true;

    while (this.buildQueue.length > 0) {
      const buildTask = this.buildQueue.shift();
      if (buildTask) {
        await buildTask();
      }
    }

    this.processingQueue = false;
  }

  /**
   * Update build statistics.
   *
   * @private
   * @param buildTime - Time taken for the build
   * @param success - Whether the build was successful
   */
  private updateStats(buildTime: number, success: boolean): void {
    this.stats.totalBuilds++;
    this.stats.lastBuildTime = buildTime;
    this.stats.lastBuildTimestamp = Date.now();

    if (success) {
      this.stats.successfulBuilds++;
    } else {
      this.stats.failedBuilds++;
    }

    // Update average build time
    this.stats.averageBuildTime =
      (this.stats.averageBuildTime * (this.stats.totalBuilds - 1) + buildTime) /
      this.stats.totalBuilds;
  }

  /**
   * Get build queue length.
   */
  get queueLength(): number {
    return this.buildQueue.length;
  }

  /**
   * Clear the build queue.
   */
  clearQueue(): void {
    this.buildQueue = [];
  }

  /**
   * Get detailed build information.
   */
  getDetailedInfo(): {
    isBuilding: boolean;
    queueLength: number;
    stats: BuildStats;
    successRate: number;
  } {
    const successRate =
      this.stats.totalBuilds > 0
        ? (this.stats.successfulBuilds / this.stats.totalBuilds) * 100
        : 0;

    return {
      isBuilding: this.isBuilding,
      queueLength: this.buildQueue.length,
      stats: this.getStatistics(),
      successRate,
    };
  }
}
