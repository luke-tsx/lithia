import { defineLithiaConfig } from 'lithia';
import type { LithiaConfig, LithiaRequest, LithiaResponse } from 'lithia/types';

const config: LithiaConfig = {
  debug: true,
  server: {
    host: '0.0.0.0',
    port: 3000,
    request: {
      queryParser: {
        array: {
          enabled: true,
          delimiter: ',',
        },
        number: {
          enabled: true,
        },
        boolean: {
          enabled: true,
        },
      },
      maxBodySize: 1048576,
    },
  },
  build: {
    mode: 'no-bundle',
  },
  studio: {
    enabled: true,
  },
  cors: {
    exposedHeaders: ['X-Powered-By'],
  },
  hooks: {
    'request:after': [
      (_req: LithiaRequest, _res: LithiaResponse) => {
        console.log('Request after');
      },
    ],
  },
};

export default defineLithiaConfig(config);
