import CliTable3 from 'cli-table3';
import { Lithia, Route } from 'lithia/types';
import { readFileSync } from 'node:fs';
import { buildDev } from './dev';
import { buildProd } from './prod';

export async function build(lithia: Lithia) {
  if (lithia.options._cli.command === 'dev') {
    return buildDev(lithia);
  }

  return buildProd(lithia);
}

export function printRoutesOverview(routes: Route[]) {
  const table = new CliTable3({
    head: ['Method', 'Path', 'Environment', 'Length'],
    style: {
      head: ['green'],
    },
  });

  routes.forEach((route) => {
    table.push([
      route.method || 'ALL',
      route.path,
      route.env || 'all',
      `${readFileSync(route.filePath).length} bytes`,
    ]);
  });

  console.log(table.toString());
}
