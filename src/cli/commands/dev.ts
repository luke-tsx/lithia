import { defineCommand } from 'citty';
import consola from 'consola';
import { Lithia } from 'lithia/types';
import { createHttpServer, createLithia } from 'lithia';

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Start the development server',
  },
  async run() {
    let lithia: Lithia;

    const reload = async () => {
      if (lithia) {
        consola.info('Restarting dev server...\n');
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

              if (diff.length === 0) {
                return;
              }

              consola.info(
                'Lithia config updated:\n' +
                  diff.map((entry) => `  ${entry.toString()}`).join('\n') +
                  '\n',
              );

              await reload();
            },
          },
        },
      );

      const server = createHttpServer(lithia);

      lithia.hooks.hookOnce('restart', reload);
      lithia.hooks.hookOnce('close', () => {
        server.close();
      });
    };

    await reload();
  },
});
