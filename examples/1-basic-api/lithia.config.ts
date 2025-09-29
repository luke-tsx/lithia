import { defineLithiaConfig } from 'lithia';
import type { LithiaConfig, LithiaRequest, LithiaResponse } from 'lithia/types';

const config: LithiaConfig = {
  debug: false,
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
  hooks: {},
};

export default defineLithiaConfig(config);
