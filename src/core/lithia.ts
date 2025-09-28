import { createDebugger, createHooks } from 'hookable';
import {
  Lithia,
  LithiaConfig,
  LoadConfigOptions,
  LithiaHooks,
} from 'lithia/types';
import { loadOptions } from './config/loader';
import { ConsoleLogger, Logger } from './log/logger';

/**
 * Registers hooks from configuration into the Lithia instance.
 *
 * @param lithia - Lithia instance
 * @param hooksConfig - Hooks configuration from lithia.config.js
 */
function registerHooksFromConfig(
  lithia: Lithia,
  hooksConfig: Lithia['options']['hooks'],
): void {
  if (!hooksConfig) return;

  // Register each hook type from configuration
  for (const [hookName, handlers] of Object.entries(hooksConfig)) {
    if (Array.isArray(handlers)) {
      for (const handler of handlers) {
        lithia.hooks.hook(hookName as keyof LithiaHooks, handler);
      }
    }
  }
}

/**
 * Creates a new Lithia instance with the provided configuration.
 *
 * @param config - Lithia configuration object
 * @param opts - Configuration loading options
 * @param logger - Optional custom logger instance
 * @returns Promise resolving to configured Lithia instance
 *
 * @example
 * ```typescript
 * const lithia = await createLithia({
 *   server: { port: 3000 },
 *   build: { mode: 'no-bundle' }
 * });
 *
 * // Use hooks for extensibility
 * lithia.hooks.hook('server:beforeStart', () => {
 *   console.log('Starting server...');
 * });
 * ```
 */
export async function createLithia(
  config: LithiaConfig = {},
  opts: LoadConfigOptions = {},
  logger?: Logger,
): Promise<Lithia> {
  // Load and merge configuration
  const options = await loadOptions(config, opts);

  // Initialize logger
  const lithiaLogger =
    logger ||
    new ConsoleLogger({
      debug: options.debug,
    });

  // Create Lithia instance with hooks
  const lithia: Lithia = {
    options,
    hooks: createHooks(),
    logger: lithiaLogger,
  };

  // Register hooks from configuration
  registerHooksFromConfig(lithia, options.hooks);

  // Enable debugger if debug mode is on
  if (lithia.options.debug) {
    createDebugger(lithia.hooks, { tag: 'lithia' });
  }

  // Log successful initialization
  lithiaLogger.debug(`Lithia instance created successfully`);
  lithiaLogger.debug('Configuration loaded:', {
    port: options.server.port,
    host: options.server.host,
    buildMode: options.build.mode,
    environment: options._env,
    hooksEnabled: true,
    registeredHooks: Object.keys(options.hooks || {}).length,
  });

  return lithia;
}
