import { createLithia } from 'lithia/core';
import { LithiaStudio } from 'lithia/studio';
import type { Lithia } from 'lithia/types';
import { BuildMonitor } from './build-monitor';
import { DevServerEventEmitter, DevServerEventType } from './events';
import { FileWatcher, FileWatcherOptions } from './file-watcher';
import { ServerConfig, ServerManager } from './server-manager';

/**
 * Development server configuration options.
 */
export interface DevServerOptions {
  /** Server configuration */
  server: ServerConfig;
  /** File watching options */
  fileWatcher?: Partial<FileWatcherOptions>;
  /** Whether to enable auto-reload */
  autoReload?: boolean;
  /** Whether to enable verbose logging */
  verbose?: boolean;
  /** Maximum reload attempts */
  maxReloadAttempts?: number;
}

/**
 * Development server statistics.
 */
export interface DevServerStats {
  /** Server statistics */
  server: any;
  /** Build statistics */
  build: any;
  /** File watcher statistics */
  fileWatcher: any;
  /** Overall uptime */
  uptime: number;
  /** Total reloads performed */
  totalReloads: number;
  /** Successful reloads */
  successfulReloads: number;
  /** Failed reloads */
  failedReloads: number;
}

/**
 * Main development server manager.
 *
 * Orchestrates all components of the development server including
 * file watching, building, and HTTP server management.
 */
export class DevServerManager {
  private eventEmitter: DevServerEventEmitter;
  private lithia?: Lithia;
  private fileWatcher?: FileWatcher;
  private buildMonitor?: BuildMonitor;
  private serverManager?: ServerManager;
  private studio?: LithiaStudio;
  private options: DevServerOptions;
  private isInitialized = false;
  private isRunning = false;
  private totalReloads = 0;
  private successfulReloads = 0;
  private failedReloads = 0;
  private startTime?: number;

  constructor(options: DevServerOptions) {
    this.options = {
      autoReload: true,
      verbose: false,
      maxReloadAttempts: 3,
      ...options,
    };

    this.eventEmitter = new DevServerEventEmitter();
    this.setupEventHandlers();
  }

  /**
   * Initialize the development server.
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Create Lithia instance
      this.lithia = await createLithia({
        _env: 'dev',
        _cli: { command: 'dev' },
        server: {
          port: this.options.server.port,
          host: this.options.server.host,
        },
        logger: {
          level: this.options.verbose ? 'debug' : 'info',
        },
      });

      // Initialize components
      this.buildMonitor = new BuildMonitor(this.eventEmitter, this.lithia);
      this.serverManager = new ServerManager(
        this.eventEmitter,
        this.lithia,
        this.options.server,
      );

      // Initialize Studio if enabled in config
      if (this.lithia.options.studio.enabled) {
        this.studio = new LithiaStudio(this.lithia);
      }

      // Setup file watcher if auto-reload is enabled
      if (this.options.autoReload) {
        this.fileWatcher = new FileWatcher(this.eventEmitter, {
          watchDir: this.lithia.options.srcDir,
          ...this.options.fileWatcher,
        });
      }
      this.isInitialized = true;

      if (this.options.verbose) {
        this.lithia.logger.info('Development server initialized');
      }
    } catch (error) {
      throw new Error(`Failed to initialize development server: ${error}`);
    }
  }

  /**
   * Start the development server.
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    if (this.isRunning) {
      return;
    }

    this.startTime = Date.now();
    this.isRunning = true;

    try {
      // Start file watcher first
      if (this.fileWatcher) {
        await this.fileWatcher.start();
      }

      // Perform initial build
      await this.buildMonitor!.build('Initial build');

      // Start HTTP server
      await this.serverManager!.start();

      // Start Studio if enabled
      if (this.studio) {
        await this.studio.start();
      }

      if (this.options.verbose) {
        this.lithia!.logger.info('Development server started successfully');
      }
    } catch (error) {
      this.isRunning = false;
      this.lithia!.logger.error('Failed to start development server:', error);
      throw error;
    }
  }

  /**
   * Stop the development server.
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    try {
      // Stop components in reverse order
      if (this.studio) {
        await this.studio.stop();
      }

      if (this.serverManager) {
        await this.serverManager.stop();
      }

      if (this.fileWatcher) {
        await this.fileWatcher.stop();
      }

      if (this.options.verbose) {
        this.lithia!.logger.info('Development server stopped');
      }
    } catch (error) {
      this.lithia!.logger.error('Error stopping development server:', error);
      throw error;
    }
  }

  /**
   * Restart the development server.
   */
  async restart(): Promise<void> {
    if (this.options.verbose) {
      this.lithia!.logger.wait('Restarting development server...');
    }

    this.totalReloads++;

    try {
      await this.stop();
      await this.start();

      this.successfulReloads++;

      if (this.options.verbose) {
        this.lithia!.logger.success(
          'Development server restarted successfully',
        );
      }
    } catch (error) {
      this.failedReloads++;
      this.lithia!.logger.error('Failed to restart development server:', error);
      throw error;
    }
  }

  /**
   * Perform a soft reload (rebuild only).
   */
  async softReload(): Promise<void> {
    if (!this.isRunning || !this.buildMonitor) {
      return;
    }

    this.totalReloads++;

    try {
      const success = await this.buildMonitor.build('File change detected');

      if (success) {
        this.successfulReloads++;
      } else {
        this.failedReloads++;
      }
    } catch (error) {
      this.failedReloads++;
      this.lithia!.logger.error('Soft reload failed:', error);
    }
  }

  /**
   * Check if the development server is running.
   */
  get running(): boolean {
    return this.isRunning;
  }

  /**
   * Get the Lithia instance.
   */
  get lithiaInstance(): Lithia | undefined {
    return this.lithia;
  }

  /**
   * Get development server statistics.
   */
  getStatistics(): DevServerStats {
    return {
      server: this.serverManager?.getStatistics(),
      build: this.buildMonitor?.getStatistics(),
      fileWatcher: this.fileWatcher?.getStats(),
      uptime: this.startTime ? Date.now() - this.startTime : 0,
      totalReloads: this.totalReloads,
      successfulReloads: this.successfulReloads,
      failedReloads: this.failedReloads,
    };
  }

  /**
   * Update server configuration.
   *
   * @param newOptions - New configuration options
   */
  updateOptions(newOptions: Partial<DevServerOptions>): void {
    this.options = { ...this.options, ...newOptions };

    if (this.serverManager && newOptions.server) {
      this.serverManager.updateConfig(newOptions.server);
    }
  }

  /**
   * Get current configuration.
   */
  getOptions(): DevServerOptions {
    return { ...this.options };
  }

  /**
   * Setup event handlers for the development server.
   *
   * @private
   */
  private setupEventHandlers(): void {
    // File change events
    this.eventEmitter.on(DevServerEventType.FILE_CHANGED, async () => {
      if (this.options.autoReload) {
        await this.softReload();
      }
    });

    this.eventEmitter.on(DevServerEventType.FILE_ADDED, async () => {
      if (this.options.autoReload) {
        await this.softReload();
      }
    });

    this.eventEmitter.on(DevServerEventType.FILE_DELETED, async () => {
      if (this.options.autoReload) {
        await this.softReload();
      }
    });

    // Build events
    this.eventEmitter.on(DevServerEventType.BUILD_SUCCESS, async (event) => {
      if (this.options.verbose) {
        this.lithia?.logger.info('Build success:', event.data);
      }

      // Emit to Studio if enabled
      if (this.studio) {
        this.studio.emitBuildStatus(true);
        // Send updated manifest to Studio
        try {
          this.studio.emitManifestUpdate();
        } catch (error) {
          this.lithia?.logger.error('Error sending manifest to Studio:', error);
        }
      }
    });

    this.eventEmitter.on(DevServerEventType.BUILD_ERROR, async (event) => {
      if (this.options.verbose) {
        this.lithia?.logger.error('Build error:', event.data);
      }

      // Emit to Studio if enabled
      if (this.studio) {
        this.studio.emitBuildStatus(
          false,
          event.data?.errors?.[0]?.message || 'Build failed',
        );
      }
    });

    // Server events
    this.eventEmitter.on(DevServerEventType.SERVER_ERROR, async (event) => {
      this.lithia?.logger.error('Server error:', event.data);
    });

    // Watcher events
    this.eventEmitter.on(DevServerEventType.WATCHER_ERROR, async (event) => {
      this.lithia?.logger.error('File watcher error:', event.data);
    });
  }

  /**
   * Get detailed information about the development server.
   */
  getDetailedInfo(): {
    isInitialized: boolean;
    isRunning: boolean;
    options: DevServerOptions;
    stats: DevServerStats;
    components: {
      fileWatcher: boolean;
      buildMonitor: boolean;
      serverManager: boolean;
    };
  } {
    return {
      isInitialized: this.isInitialized,
      isRunning: this.isRunning,
      options: this.getOptions(),
      stats: this.getStatistics(),
      components: {
        fileWatcher: !!this.fileWatcher,
        buildMonitor: !!this.buildMonitor,
        serverManager: !!this.serverManager,
      },
    };
  }

  /**
   * Cleanup resources and stop the development server.
   */
  async cleanup(): Promise<void> {
    try {
      await this.stop();
      this.eventEmitter.removeAllListeners();
    } catch (error) {
      this.lithia?.logger.error('Error during cleanup:', error);
    }
  }
}
