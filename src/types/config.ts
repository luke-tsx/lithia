import {
  C12InputConfig,
  ConfigWatcher,
  ResolvedConfig,
  WatchConfigOptions,
} from 'c12';
import { BuiltinDriverName } from 'unstorage';
import type { DeepPartial } from './_utils';

export interface LithiaOptions {
  // Internal
  _cli: {
    command: string;
  };
  _env: 'dev' | 'prod';
  _c12: ResolvedConfig<LithiaConfig> | ConfigWatcher<LithiaConfig>;

  // General
  debug: boolean;

  // Dirs
  srcDir: string;
  routesDir: string;
  outputDir: string;

  // Features
  storage: StorageMounts;
  devStorage: StorageMounts;

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
    };
  };
}

export interface LithiaConfig
  extends DeepPartial<LithiaOptions>,
    C12InputConfig<LithiaConfig> {}

export interface LoadConfigOptions {
  watch?: boolean;
  c12?: WatchConfigOptions;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CustomDriverName = string & { _custom?: any };

export interface StorageMounts {
  [path: string]: {
    driver: BuiltinDriverName | CustomDriverName;
  };
}
