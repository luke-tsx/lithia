import importFresh from 'import-fresh';
import { Lithia, Route } from 'lithia/types';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { getOutputPath } from '../_utils';

export async function createRoutesManifest(lithia: Lithia, routes: Route[]) {
  for (const route of routes) {
    route.filePath = getOutputPath(lithia, route.filePath);
  }

  await writeFile(
    `${lithia.options.outputDir}/routes.json`,
    JSON.stringify(routes, null, 2),
  );
}

export function getRoutesFromManifest(lithia: Lithia): Route[] {
  return importFresh(path.join(
    process.cwd(),
    lithia.options.outputDir,
    'routes.json',
  ));
}