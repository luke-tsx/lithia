import { Lithia } from 'lithia/types';
import { mkdir, rm } from 'node:fs/promises';

export async function prepare(lithia: Lithia) {
  await rm(lithia.options.outputDir, { recursive: true, force: true });
  await mkdir(lithia.options.outputDir, { recursive: true });
}
