import chokidar, { ChokidarOptions, FSWatcher } from 'chokidar';
import { defineCommand } from 'citty';
import {
  build,
  createHttpServer,
  createLithia,
  info,
  prepare,
  wait,
} from 'lithia/core';
import type { Lithia } from 'lithia/types';
import lodash from 'lodash';
import { setTimeout } from 'node:timers/promises';

interface DevServerState {
  lithia?: Lithia;
  watcher?: FSWatcher;
  server?: ReturnType<typeof createHttpServer>;
  restartPending: boolean;
  configChanged: boolean;
}

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Start the development server',
  },
  args: {
    studio: {
      type: 'boolean',
      description: 'Start the studio server',
      default: false,
    },
  },
  async run() {
    let isFirstRun = true;

    const state: DevServerState = {
      restartPending: false,
      configChanged: false,
    };

    const WATCHER_OPTIONS: ChokidarOptions = {
      ignoreInitial: true,
      atomic: 500,
      ignored: ['**/node_modules/**', '**/.git/**', '**/dist/**'],
      awaitWriteFinish: {
        stabilityThreshold: 300,
        pollInterval: 100,
      },
    };

    const DEBOUNCE_DELAY = 300;
    const MAX_RELOAD_ATTEMPTS = 3;

    const setupWatcher = (lithia: Lithia) => {
      state.watcher = chokidar.watch(lithia.options.srcDir, WATCHER_OPTIONS);

      const handleFileChange = lodash.debounce(async () => {
        if (state.restartPending) return;
        await softReload();
      }, DEBOUNCE_DELAY);

      state.watcher
        .on('add', handleFileChange)
        .on('change', handleFileChange)
        .on('unlink', handleFileChange);

      return state.watcher;
    };

    const cleanup = async (fullCleanup: boolean) => {
      try {
        if (fullCleanup && state.server) {
          state.server.close();
          info('Server stopped successfully');
        }

        if (state.watcher) {
          await state.watcher.close();
          info('File watcher stopped');
        }

        if (fullCleanup && state.lithia) {
          await state.lithia.hooks.callHook('close');
          info('Lithia instance cleaned up');
        }
      } catch (error) {
        console.error('Cleanup error:', error);
      }
    };

    const softReload = async (attempt = 1) => {
      if (state.restartPending || !state.lithia) return;
      state.restartPending = true;

      try {
        wait('Recompiling project...');

        // Apenas recompila sem recriar instâncias
        await prepare(state.lithia);
        await build(state.lithia);

        info('Project recompiled successfully');
      } catch (error) {
        console.error(
          `Recompile failed (attempt ${attempt}/${MAX_RELOAD_ATTEMPTS}):`,
          error,
        );

        if (attempt < MAX_RELOAD_ATTEMPTS) {
          await setTimeout(1000 * attempt);
          await softReload(attempt + 1);
        }
      } finally {
        state.restartPending = false;
      }
    };

    const fullReload = async (attempt = 1) => {
      if (state.restartPending) return;
      state.restartPending = true;

      try {
        if (!isFirstRun) {
          wait('Reloading dev server...');
          await cleanup(false);
        }

        // Limpeza completa
        await cleanup(true);
        await setTimeout(500);

        // Nova instância do Lithia
        state.lithia = await createLithia(
          {
            _env: 'dev',
            _cli: { command: 'dev' },
          },
          {
            watch: true,
            c12: {
              async onUpdate({ getDiff }) {
                const diff = getDiff();
                if (diff.length === 0) return;

                info('Detected configuration changes, reloading dev server...');
                state.configChanged = true;
                await fullReload();
              },
            },
          },
        );

        // Configuração do ambiente
        await prepare(state.lithia);
        await build(state.lithia);

        // Servidor HTTP
        state.server = createHttpServer(state.lithia);
        state.server.on('error', (error) => {
          console.error('Server error:', error);
        });

        // Novo watcher
        setupWatcher(state.lithia);

        if (!isFirstRun) {
          info('Development server reloaded successfully');
        }
      } catch (error) {
        console.error(
          `Reload failed (attempt ${attempt}/${MAX_RELOAD_ATTEMPTS}):`,
          error,
        );

        if (attempt < MAX_RELOAD_ATTEMPTS) {
          await setTimeout(1000 * attempt);
          await fullReload(attempt + 1);
        } else {
          console.error('Maximum reload attempts reached. Exiting...');
          process.exit(1);
        }
      } finally {
        state.restartPending = false;
        state.configChanged = false;
        isFirstRun = false;
      }
    };

    // Handlers de processo
    process.on('SIGINT', async () => {
      info('Shutting down gracefully...');
      await cleanup(true);
      process.exit(0);
    });

    process.on('uncaughtException', async (error) => {
      console.error('Uncaught exception:', error);
      await cleanup(true);
      process.exit(1);
    });

    // Iniciar o servidor
    await fullReload();
  },
});
