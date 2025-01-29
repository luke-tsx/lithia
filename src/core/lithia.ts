import consola from 'consola';
import { createDebugger, createHooks } from 'hookable';
import { Lithia, LithiaConfig, LoadConfigOptions } from 'lithia/types';
import { loadOptions } from './config/loader';

export async function createLithia(
  config: LithiaConfig = {},
  opts: LoadConfigOptions = {},
): Promise<Lithia> {
  const options = await loadOptions(config, opts);

  const lithia: Lithia = {
    options,
    hooks: createHooks(),
    logger: consola.withTag('lithia'),
  };

  if (lithia.options.debug) {
    createDebugger(lithia.hooks, { tag: 'lithia' });
  }

  return lithia;
}
