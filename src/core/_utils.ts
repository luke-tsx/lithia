import type { Lithia } from 'lithia/types';

export function getOutputPath(_lithia: Lithia, filePath: string) {
  return filePath.replace('src', '.lithia').replace(/\.ts$/, '.js');
}
