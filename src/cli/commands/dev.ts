import chokidar from 'chokidar';
import { defineCommand } from 'citty';
import consola from 'consola';
import { build, createHttpServer, createLithia, prepare } from 'lithia';
import { Lithia } from 'lithia/types';
import lodash from 'lodash';
import path from 'node:path';

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Start the development server',
  },
  async run() {
    let lithia: Lithia;
    let restartPending = false;

    const setupWatcher = (lithia: Lithia) => {
      const watcher = chokidar.watch(
        path.join(lithia.options.srcDir, lithia.options.routesDir),
        {
          ignoreInitial: true,
          atomic: true
        }
      );

      const debouncedReload = lodash.debounce(async (pathChanged: string) => {
        if (restartPending) return;
        
        restartPending = true;
        consola.info(`File changed: ${path.relative(process.cwd(), pathChanged)}`);
        await reload();
        restartPending = false;
      }, 300);

      watcher
        .on('add', debouncedReload)
        .on('change', debouncedReload)
        .on('unlink', debouncedReload);

      return watcher;
    };

    const reload = async () => {
      if (lithia) {
        consola.info('Restarting dev server...');
        await lithia.hooks.callHook('close');
      }

      lithia = await createLithia(
        {
          _env: 'dev',
          _cli: {
            command: 'dev',
          },
        },
        {
          watch: true,
          c12: {
            async onUpdate({ getDiff }) {
              const diff = getDiff();
              if (diff.length > 0) {
                consola.info(
                  'Config updated:\n' +
                  diff.map((entry) => `  ${entry.toString()}`).join('\n')
                );
                await reload();
              }
            },
          },
        },
      );

      const watcher = setupWatcher(lithia);
      
      await prepare(lithia);
      await build(lithia);

      const server = createHttpServer(lithia);

      lithia.hooks.hookOnce('restart', reload);
      lithia.hooks.hookOnce('close', () => {
        watcher.close();
        server.close();
      });
    };

    await reload();
  },
});