import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';
import consola from 'consola';
import esbuild from 'esbuild';
import { Lithia } from 'lithia/types';
import path from 'node:path';
import { scanServerRoutes } from '../scan';
import { createRoutesManifest } from '../server/router';
import { printRoutesOverview } from './build';

export async function buildProd(lithia: Lithia) {
  consola.info('Building your Lithia app for production...');

  const routes = await scanServerRoutes(lithia);

  await esbuild.build({
    entryPoints: routes.map((route) => route.filePath),
    bundle: true,
    outdir: path.join(lithia.options.outputDir, lithia.options.routesDir),
    platform: 'node',
    format: 'esm',
    packages: 'external',
    sourcemap: true,
    minify: true,
    plugins: [
      TsconfigPathsPlugin({
        tsconfig: path.join(process.cwd(), 'tsconfig.json'),
      }),
    ],
  });

  await createRoutesManifest(lithia, routes);
  printRoutesOverview(routes);

  consola.success(`${routes.length} routes have been built successfully!`);
}