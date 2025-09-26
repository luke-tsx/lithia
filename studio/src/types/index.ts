export interface Route {
  method?: string;
  path: string;
  dynamic: boolean;
  filePath: string;
  regex: string;
}

export interface StudioConfig {
  lithiaPort: number;
  studioPort: number;
  wsPort: number;
}

export interface StudioEvents {
  'update-manifest': { routes: Route[] };
  'manifest-error': { error: string };
  'build-status': { success: boolean; error?: string };
  'lithia-config': { config: StudioConfig };
}

export interface RequestResponse {
  status: number;
  statusText: string;
  data: any;
  headers: Record<string, string>;
}
