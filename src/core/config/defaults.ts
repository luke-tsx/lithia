import { LithiaConfig } from 'lithia/types';
import { isDebug } from 'std-env';

export const LithiaDefaults: LithiaConfig = {
  // General
  debug: isDebug,

  // Dirs
  srcDir: 'src',
  routesDir: 'routes',
  outputDir: '.lithia',

  // Features
  storage: {},
  devStorage: {},

  // Router
  router: {
    globalPrefix: '',
  },

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
    },
  },
};
