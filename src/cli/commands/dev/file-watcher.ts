import chokidar, { ChokidarOptions, FSWatcher } from 'chokidar';
import { DevServerEventEmitter, DevServerEventType } from './events';

/**
 * Configuration options for the file watcher.
 */
export interface FileWatcherOptions {
  /** Directory to watch */
  watchDir: string;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Whether to watch recursively */
  recursive?: boolean;
  /** File patterns to ignore */
  ignored?: string[];
  /** Whether to ignore initial events */
  ignoreInitial?: boolean;
}

/**
 * File watcher for development server.
 *
 * Monitors file system changes and emits events when files
 * are added, modified, or deleted.
 */
export class FileWatcher {
  private watcher?: FSWatcher;
  private eventEmitter: DevServerEventEmitter;
  private options: FileWatcherOptions;
  private debounceTimer?: NodeJS.Timeout;
  private isWatching = false;

  constructor(
    eventEmitter: DevServerEventEmitter,
    options: FileWatcherOptions,
  ) {
    this.eventEmitter = eventEmitter;
    this.options = {
      debounceDelay: 300,
      recursive: true,
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.lithia/**',
      ],
      ignoreInitial: true,
      ...options,
    };
  }

  /**
   * Start watching for file changes.
   */
  async start(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    try {
      const watcherOptions: ChokidarOptions = {
        ignoreInitial: this.options.ignoreInitial,
        atomic: 500,
        ignored: this.options.ignored,
        awaitWriteFinish: {
          stabilityThreshold: 300,
          pollInterval: 100,
        },
      };

      this.watcher = chokidar.watch(this.options.watchDir, watcherOptions);

      this.setupEventHandlers();
      this.isWatching = true;

      await this.eventEmitter.emit(DevServerEventType.WATCHER_READY, {
        watchDir: this.options.watchDir,
        options: watcherOptions,
      });
    } catch (error) {
      await this.eventEmitter.emit(DevServerEventType.WATCHER_ERROR, {
        error,
        watchDir: this.options.watchDir,
      });
      throw error;
    }
  }

  /**
   * Stop watching for file changes.
   */
  async stop(): Promise<void> {
    if (!this.isWatching || !this.watcher) {
      return;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = undefined;
    }

    await this.watcher.close();
    this.watcher = undefined;
    this.isWatching = false;
  }

  /**
   * Check if the watcher is currently active.
   */
  get watching(): boolean {
    return this.isWatching;
  }

  /**
   * Get the current watch directory.
   */
  get watchDirectory(): string {
    return this.options.watchDir;
  }

  /**
   * Update the watch directory.
   *
   * @param newWatchDir - New directory to watch
   */
  async updateWatchDirectory(newWatchDir: string): Promise<void> {
    if (newWatchDir === this.options.watchDir) {
      return;
    }

    await this.stop();
    this.options.watchDir = newWatchDir;
    await this.start();
  }

  /**
   * Setup event handlers for the file watcher.
   *
   * @private
   */
  private setupEventHandlers(): void {
    if (!this.watcher) {
      return;
    }

    const debouncedEmit = this.debounce(
      (eventType: string, filePath: string) => {
        this.eventEmitter.emit(eventType, { filePath, timestamp: Date.now() });
      },
      this.options.debounceDelay!,
    );

    this.watcher
      .on('add', (filePath) => {
        debouncedEmit(DevServerEventType.FILE_ADDED, filePath);
      })
      .on('change', (filePath) => {
        debouncedEmit(DevServerEventType.FILE_CHANGED, filePath);
      })
      .on('unlink', (filePath) => {
        debouncedEmit(DevServerEventType.FILE_DELETED, filePath);
      })
      .on('error', async (error) => {
        await this.eventEmitter.emit(DevServerEventType.WATCHER_ERROR, {
          error,
          watchDir: this.options.watchDir,
        });
      });
  }

  /**
   * Create a debounced function.
   *
   * @private
   * @param func - Function to debounce
   * @param delay - Delay in milliseconds
   * @returns Debounced function
   */
  private debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number,
  ): T {
    return ((...args: Parameters<T>) => {
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(() => {
        func(...args);
      }, delay);
    }) as T;
  }

  /**
   * Get statistics about the file watcher.
   */
  getStats(): {
    isWatching: boolean;
    watchDir: string;
    debounceDelay: number;
    ignored: string[];
  } {
    return {
      isWatching: this.isWatching,
      watchDir: this.options.watchDir,
      debounceDelay: this.options.debounceDelay!,
      ignored: this.options.ignored!,
    };
  }
}
