import { defineCommand } from 'citty';
import consola from 'consola';
import { createHttpServer, createLithia } from 'lithia';
import { stat } from 'node:fs/promises';

export default defineCommand({
  meta: {
    name: 'start',
    description: 'Start the production server',
  },
  async run() {
    const lithia = await createLithia({
      _env: 'prod',
      _cli: {
        command: 'start',
      },
    });

    const outputFolderExists = await stat(lithia.options.outputDir).catch(
      () => false,
    );

    if (!outputFolderExists) {
      consola.error(
        `The output folder "${lithia.options.outputDir}" does not exist. Did you forget to build your project?`,
      );
      process.exit(1);
    }

    createHttpServer(lithia);
  },
});
