import { defineCommand } from 'citty';
import { createHttpServer, createLithia, error } from 'lithia/core';
import { stat } from 'node:fs/promises';

export default defineCommand({
  meta: {
    name: 'start',
    description: 'Start Lithia project in production mode',
  },
  async run() {
    const lithia = await createLithia({
      _env: 'prod',
      _cli: {
        command: 'build',
      },
    });

    if (!stat(lithia.options.outputDir)) {
      error('Build project first before starting it');
      process.exit(1);
    }

    createHttpServer(lithia);
  },
});
