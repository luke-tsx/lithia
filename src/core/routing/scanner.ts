import type { Lithia, Route } from 'lithia/types';
import {
  DefaultFileSystemScanner,
  type FileSystemScanner,
} from './file-system-scanner';
import { DefaultRouteProcessor, type RouteProcessor } from './route-processor';

/**
 * Interface for route scanning implementations.
 *
 * Implementations of this interface are responsible for discovering and
 * processing route files from the filesystem into Route objects that can
 * be used by the routing system.
 *
 * @interface
 */
export interface FileScanner {
  /**
   * Scans the filesystem for route files and returns processed Route objects.
   *
   * @param lithia - The Lithia instance containing configuration and context
   * @returns Promise that resolves to an array of discovered Route objects
   */
  scanRoutes(lithia: Lithia): Promise<Route[]>;
}

/**
 * Configuration options for custom scanner implementations.
 *
 * @interface
 */
export interface ScannerOptions {
  /** Patterns to ignore when scanning files */
  ignorePatterns?: string[];
  /** Patterns to include when scanning files */
  includePatterns?: string[];
  /** Whether to scan subdirectories recursively */
  recursive?: boolean;
}

/**
 * Default implementation of FileScanner that orchestrates route discovery.
 *
 * This scanner combines a FileSystemScanner for filesystem operations and a
 * RouteProcessor for converting files into Route objects. It provides a clean
 * separation of concerns while maintaining the default behavior expected by
 * the framework.
 *
 * @class
 * @implements {FileScanner}
 */
export class DefaultFileScanner implements FileScanner {
  private fileSystemScanner: FileSystemScanner;
  private routeProcessor: RouteProcessor;

  /**
   * Creates a new DefaultFileScanner instance.
   *
   * @param fileSystemScanner - Optional custom filesystem scanner implementation
   * @param routeProcessor - Optional custom route processor implementation
   */
  constructor(
    fileSystemScanner?: FileSystemScanner,
    routeProcessor?: RouteProcessor,
  ) {
    this.fileSystemScanner =
      fileSystemScanner || new DefaultFileSystemScanner();
    this.routeProcessor = routeProcessor || new DefaultRouteProcessor();
  }

  /**
   * Scans for route files and processes them into Route objects.
   *
   * This method coordinates between the filesystem scanner and route processor
   * to discover route files and convert them into the internal Route format
   * used by the routing system.
   *
   * @param lithia - The Lithia instance containing configuration
   * @returns Promise that resolves to an array of discovered Route objects
   */
  async scanRoutes(lithia: Lithia): Promise<Route[]> {
    const files = await this.fileSystemScanner.scanDirectory();
    return files.map((file) => this.routeProcessor.processFile(file, lithia));
  }
}
