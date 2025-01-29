import chokidar from 'chokidar';
import { defineCommand } from 'citty';
import consola from 'consola';
import { build, createHttpServer, createLithia, prepare } from 'lithia';
import { Lithia } from 'lithia/types';
import lodash from 'lodash';

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
        lithia.options.srcDir,
        {
          ignoreInitial: true,
          atomic: true
        }
      );

      const debounceReload = lodash.debounce(async () => {
        if (restartPending) return;

        restartPending = true;
        await reload();
        restartPending = false;
      }, 300);

      watcher
        .on('add', debounceReload)
        .on('change', debounceReload)
        .on('unlink', debounceReload);

      return watcher;
    };

    const reload = async () => {
      if (lithia) {
        consola.info('Reloading dev server...');

        if ("unwatch" in lithia.options._c12) {
          await lithia.options._c12.unwatch();
        }

        await lithia.hooks.callHook('close');
      }

      lithia = await createLithia({
        _env: 'dev',
        _cli: {
          command: 'dev',
        },
      }, {
        watch: true,
        c12: {
          async onUpdate({ getDiff }) {
            const diff = getDiff();
            if (!diff.length) return;
            consola.info('Detected changes on `lithia.config.js`, reloading dev server...');
            await reload();
          },
        },
      })

      const watcher = setupWatcher(lithia);
      await prepare(lithia);
      await build(lithia);
      const server = createHttpServer(lithia);

      lithia.hooks.hookOnce('close', async () => {
        server.close();
        await watcher.close();
      });
    }

    await reload();
  },
});