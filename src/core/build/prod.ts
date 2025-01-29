import { TsconfigPathsPlugin } from '@esbuild-plugins/tsconfig-paths';
import CliTable3 from 'cli-table3';
import consola from 'consola';
import esbuild from 'esbuild';
import { writeFile } from 'fs/promises';
import { Lithia, Route } from 'lithia/types';
import { readFileSync } from 'node:fs';
import * as path from 'node:path';
import { scanServerRoutes } from '../scan';

export async function buildProduction(lithia: Lithia) {
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

  await writeFile(
    `${lithia.options.outputDir}/routes.json`,
    JSON.stringify(routes, null, 2),
  );

  
  printRoutesOverview(routes.map((route) => ({
    ...route,
    filePath: route.filePath.replace(
      lithia.options.srcDir,
      lithia.options.outputDir,
    ).replace(/\.ts$/, '.js'),
  })));

  consola.success(`${routes.length} routes have been built successfully!`);
}

export function printRoutesOverview(routes: Route[]) {
  const table = new CliTable3({
    head: ['Method', 'Path', 'Environment', 'Type', 'Length'],
    style: {
      head: ['green'],
    },
  });

  routes.forEach((route) => {
    table.push([
      route.method || 'ALL',
      route.path,
      route.env || 'all',
      route.type,
      `${readFileSync(route.filePath).length} bytes`,
    ]);
  });

  console.log(table.toString());
}