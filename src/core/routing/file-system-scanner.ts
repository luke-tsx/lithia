import { readdir } from 'node:fs/promises';
import nodePath from 'node:path';
import type { FileInfo } from 'lithia/types';

/**
 * Interface for filesystem scanning implementations.
 *
 * Implementations of this interface are responsible for discovering TypeScript
 * files in the routes directory that can be processed into Route objects.
 *
 * @interface
 */
export interface FileSystemScanner {
  /**
   * Scans the routes directory for TypeScript files.
   *
   * @returns Promise that resolves to an array of discovered file information
   */
  scanDirectory(): Promise<FileInfo[]>;
}

/**
 * Default implementation of FileSystemScanner that uses Node.js filesystem APIs.
 *
 * This scanner recursively reads the routes directory and returns information
 * about all TypeScript files found, excluding test and spec files by default.
 *
 * @class
 * @implements {FileSystemScanner}
 */
export class DefaultFileSystemScanner implements FileSystemScanner {
  /**
   * Scans the routes directory for TypeScript files.
   *
   * Scans the fixed 'src/routes' directory recursively for .ts files while
   * filtering out test files.
   *
   * @returns Promise that resolves to an array of FileInfo objects
   */
  async scanDirectory(): Promise<FileInfo[]> {
    const dir = process.cwd();
    const name = nodePath.resolve(dir, 'src', 'routes');
    return this.scanDir({
      dir,
      name,
      ignore: ['**/*.{spec,test}.ts'],
    });
  }

  /**
   * Internal method to perform the actual directory scanning.
   *
   * @private
   * @param options - Configuration for the directory scan
   * @returns Promise that resolves to an array of FileInfo objects
   */
  private async scanDir(options: ScanDirOptions): Promise<FileInfo[]> {
    const normalizedName = options.name.replace(/\\/g, '/');
    const files = await readdir(normalizedName, {
      withFileTypes: true,
      encoding: 'utf-8',
      recursive: true,
    });

    const fileNames: string[] = [];

    for (const file of files) {
      if (file.isFile() && file.name.endsWith('.ts')) {
        fileNames.push(nodePath.join(file.parentPath, file.name));
      }
    }

    return fileNames
      .map((fullPath) => {
        const path = nodePath
          .relative(normalizedName, fullPath)
          .replace(/\\/g, '/');
        return {
          fullPath,
          path,
        };
      })
      .sort((a, b) => a.path.localeCompare(b.path));
  }
}

/**
 * Configuration options for directory scanning operations.
 *
 * @internal
 */
type ScanDirOptions = {
  /** Base directory path */
  dir: string;
  /** Target directory to scan */
  name: string;
  /** File patterns to ignore during scanning */
  ignore?: string[];
};
