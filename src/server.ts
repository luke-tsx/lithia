import { createHttpServer, createLithia, error } from 'lithia/core';
import { stat } from 'node:fs/promises';

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
  error(
    `The output folder "${lithia.options.outputDir}" does not exist. Did you forget to build your project?`,
  );
  process.exit(1);
}

createHttpServer(lithia);
