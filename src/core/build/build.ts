import CliTable3 from 'cli-table3';
import { readFileSync } from 'fs';
import { Lithia, Route } from 'lithia/types';
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