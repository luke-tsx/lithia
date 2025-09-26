import { createDebugger, createHooks } from 'hookable';
import { Lithia, LithiaConfig, LoadConfigOptions } from 'lithia/types';
import { loadOptions } from './config/loader';
import { ConsolaLogger, Logger } from './log/logger';

export async function createLithia(
  config: LithiaConfig = {},
  opts: LoadConfigOptions = {},
  logger?: Logger,
): Promise<Lithia> {
  const options = await loadOptions(config, opts);
  const lithiaLogger = logger || new ConsolaLogger(options.logger);

  const lithia: Lithia = {
    options,
    hooks: createHooks(),
    logger: lithiaLogger,
  };

  if (lithia.options.debug) {
    createDebugger(lithia.hooks, { tag: 'lithia' });
  }

  return lithia;
}
