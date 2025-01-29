import { Lithia } from "lithia/types";

export function getOutputPath(lithia: Lithia, filePath: string) {
  return filePath.replace(
    lithia.options.srcDir,
    lithia.options.outputDir,
  ).replace(/\.ts$/, '.js')
}