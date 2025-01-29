import { loadConfig, watchConfig } from 'c12';
import { klona } from 'klona/full';
import { LithiaConfig, LithiaOptions, LoadConfigOptions } from 'lithia/types';
import { LithiaDefaults } from './defaults';

export async function loadOptions(
  overrides: LithiaConfig = {},
  opts: LoadConfigOptions = {},
): Promise<LithiaOptions> {
  overrides = klona(overrides);

  const loadedConfig = await (
    opts.watch ? watchConfig<LithiaConfig> : loadConfig<LithiaConfig>
  )({
    name: 'lithia',
    cwd: process.cwd(),
    dotenv: true,
    overrides,
    defaults: LithiaDefaults,
    ...opts.c12,
  });

  const options = klona(loadedConfig.config) as LithiaOptions;

  options._config = overrides;
  options._c12 = loadedConfig;

  return options;
}
