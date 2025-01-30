import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';
import esbuild from 'esbuild';
import { Lithia } from 'lithia/types';
import path from 'path';
import { scanServerRoutes } from '../scan';
import { createRoutesManifest } from '../server/router';

export async function buildDev(lithia: Lithia) {
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
    keepNames: true,
    plugins: [
      TsconfigPathsPlugin({
        tsconfig: path.join(process.cwd(), 'tsconfig.json'),
      }),
    ],
  });

  await createRoutesManifest(lithia, routes);
}
