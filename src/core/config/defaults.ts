import { LithiaConfig } from 'lithia/types';
import { isDebug } from 'std-env';

/**
 * Default server configuration values.
 *
 * @internal
 */
const DEFAULT_SERVER_CONFIG = {
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
} as const;

/**
 * Default router configuration values.
 *
 * @internal
 */
const DEFAULT_ROUTER_CONFIG = {
  globalPrefix: '',
} as const;

/**
 * Default logger configuration values.
 *
 * @internal
 */
const DEFAULT_LOGGER_CONFIG = {
  colors: true,
  timestamp: true,
  level: 'info' as const,
} as const;

/**
 * Default build configuration values.
 *
 * @internal
 */
const DEFAULT_BUILD_CONFIG = {
  mode: 'no-bundle' as const,
  externalPackages: [
    'drizzle-orm',
    'drizzle-kit',
    'lodash',
    'lodash-es',
    'moment',
    'date-fns',
    'axios',
    'node-fetch',
    'ws',
    'socket.io',
    'prisma',
    '@prisma/client',
    'mongoose',
    'sequelize',
    'typeorm',
    'knex',
    'pg',
    'mysql2',
    'sqlite3',
    'better-sqlite3',
    'zod',
  ] as string[],
  optimize: false,
} as const;

/**
 * Default directory configuration values.
 *
 * @internal
 */
const DEFAULT_DIR_CONFIG = {
  srcDir: 'src',
  routesDir: 'routes',
  outputDir: '.lithia',
} as const;

/**
 * Default Lithia configuration object.
 *
 * This object contains all the default values used by the framework when no
 * custom configuration is provided. It serves as the base configuration that
 * gets merged with user-provided overrides.
 *
 * The configuration is organized into logical sections:
 * - General settings (debug mode)
 * - Directory paths for source, routes, and output
 * - Server configuration (host, port, request parsing)
 * - Router settings (global prefix)
 * - Logger configuration (colors, timestamps, log level)
 * - Global middleware array
 *
 * @constant
 * @example
 * ```typescript
 * // Use defaults directly
 * const lithia = await createLithia(LithiaDefaults);
 *
 * // Merge with custom config
 * const config = { ...LithiaDefaults, server: { port: 8080 } };
 * const lithia = await createLithia(config);
 * ```
 */
export const LithiaDefaults: LithiaConfig = {
  // General configuration
  debug: isDebug,

  // Directory configuration
  ...DEFAULT_DIR_CONFIG,

  // Router configuration
  router: DEFAULT_ROUTER_CONFIG,

  // Server configuration
  server: DEFAULT_SERVER_CONFIG,

  // Logger configuration
  logger: DEFAULT_LOGGER_CONFIG,

  // Build configuration
  build: DEFAULT_BUILD_CONFIG,

  // Global middleware configuration
  globalMiddlewares: [],
};
