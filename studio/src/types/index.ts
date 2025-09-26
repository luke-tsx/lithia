export interface Route {
  method?: string;
  path: string;
  dynamic: boolean;
  filePath: string;
  regex: string;
}

export interface LithiaOptions {
  debug: boolean;
  srcDir: string;
  routesDir: string;
  outputDir: string;
  router: {
    globalPrefix: string;
  };
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
  logger: {
    colors: boolean;
    timestamp: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
  build: {
    mode: 'no-bundle' | 'full-bundle';
    externalPackages: string[];
  };
  studio: {
    enabled: boolean;
    port: number;
  };
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
