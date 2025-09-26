import {
  C12InputConfig,
  ConfigWatcher,
  ResolvedConfig,
  WatchConfigOptions,
} from 'c12';
import type { DeepPartial } from './_utils';
import { LithiaMiddleware } from './handler';
import { LithiaHooks } from './hooks';

export interface LithiaOptions {
  // Internal
  _cli: {
    command: string;
  };
  _env: 'dev' | 'prod';
  _c12: ResolvedConfig<LithiaConfig> | ConfigWatcher<LithiaConfig>;
  _config: LithiaConfig;

  // General
  debug: boolean;

  // Dirs
  srcDir: string;
  routesDir: string;
  outputDir: string;

  // Router
  router: {
    globalPrefix: string;
  };

  // Server
  server: {
    port: number;
    host: string;
    request: {
      queryParser: {
        array: {
          enabled: boolean;
          delimiter: string;
        };
        number: {
          enabled: boolean;
        };
        boolean: {
          enabled: boolean;
        };
      };
      maxBodySize: number;
    };
  };

  // Logger
  logger: {
    colors: boolean;
    timestamp: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };

  // Build
  build: {
    mode: 'no-bundle' | 'full-bundle';
    externalPackages: string[];
  };

  // Hooks configuration
  hooks: Partial<{
    [K in keyof LithiaHooks]: LithiaHooks[K][];
  }>;

  // Studio configuration
  studio: {
    enabled: boolean;
    port: number;
  };

  globalMiddlewares: LithiaMiddleware[];
}

export interface LithiaConfig
  extends DeepPartial<LithiaOptions>,
    C12InputConfig<LithiaConfig> {}

export interface LoadConfigOptions {
  watch?: boolean;
  c12?: WatchConfigOptions;
}
