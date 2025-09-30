import { defineLithiaConfig } from 'lithia';
import type { LithiaConfig, LithiaRequest, LithiaResponse } from 'lithia/types';

const config: LithiaConfig = {
  debug: false,
  server: {
    host: '0.0.0.0',
    port: 3001,
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
  studio: {
    enabled: true,
  },
  cors: {
    exposedHeaders: ['X-Powered-By'],
  },
  hooks: {},
  build: {
    builder: 'swc',
  },
};

export default defineLithiaConfig(config);
