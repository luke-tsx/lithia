import { Lithia } from 'lithia/types';

export function getOutputPath(lithia: Lithia, filePath: string) {
  return filePath.replace('src', '.lithia').replace(/\.ts$/, '.js');
}
