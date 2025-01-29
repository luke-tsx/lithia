import { Lithia } from 'lithia/types';
import { watchDev } from './dev';
import { buildProduction } from './prod';

export async function build(lithia: Lithia) {
  return lithia.options._cli.command === 'dev'
    ? watchDev(lithia)
    : buildProduction(lithia);
}

