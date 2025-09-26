export interface Route {
  method?: string;
  path: string;
  dynamic: boolean;
  filePath: string;
  regex: string;
}

export interface LithiaOptions {
  // Internal
  _cli: {
    command: string;
  };
  _env: 'dev' | 'prod';
  _c12: any;
  _config: any;

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
    [K in string]: any[];
  }>;

  // Studio configuration
  studio: {
    enabled: boolean;
    port: number;
    wsPort: number;
  };

  globalMiddlewares: any[];
}

export interface StudioEvents {
  'update-manifest': { routes: Route[] };
  'manifest-error': { error: string };
  'build-status': { success: boolean; error?: string };
  'lithia-config': { config: LithiaOptions };
}

export interface RequestResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
}
