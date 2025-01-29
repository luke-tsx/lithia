import { globby } from 'globby';
import {
  FileInfo,
  Lithia,
  MatchedEnvSuffix,
  MatchedMethodSuffix,
  MatchedTypeSuffix,
  Route,
} from 'lithia/types';
import { join, relative } from 'path';
import { withBase, withLeadingSlash, withoutTrailingSlash } from 'ufo';
import { getOutputPath } from './_utils';

const GLOB_SCAN_PATTERN = '**/*.ts';

const suffixRegex =
  /(\.(?<method>connect|delete|get|head|options|patch|post|put|trace))?(\.(?<env>dev|prod))?(\.(?<type>lazy|prerender))?$/;

export async function scanServerRoutes(lithia: Lithia): Promise<Route[]> {
  const files = await scanDir({
    dir: process.cwd(),
    name: join(lithia.options.srcDir, lithia.options.routesDir),
    ignore: ['**/*.{spec,test}.ts'],
  });

  return files.map((file) => {
    let path = file.path
      .replace(/\.[A-Za-z]+$/, '')
      .replace(/\(([^(/\\]+)\)[/\\]/g, '')
      .replace(/\[\.{3}]/g, '**')
      .replace(/\[\.{3}(\w+)]/g, '**:$1')
      .replace(/\[([^/\]]+)]/g, ':$1');

    path = withLeadingSlash(
      withoutTrailingSlash(withBase(path, lithia.options.router.globalPrefix)),
    );
    const suffixMatch = path.match(suffixRegex);
    let method: MatchedMethodSuffix | undefined;
    let env: MatchedEnvSuffix | undefined;
    let type: MatchedTypeSuffix | undefined;

    if (suffixMatch?.index && suffixMatch?.index >= 0) {
      path = path.slice(0, suffixMatch.index);
      method = suffixMatch.groups?.method?.toUpperCase() as
        | MatchedMethodSuffix
        | undefined;
      env = suffixMatch.groups?.env as MatchedEnvSuffix | undefined;
      type = suffixMatch.groups?.type as MatchedTypeSuffix | undefined;
    }

    path = path.replace(/\/index$/, '') || '/';
    const filePath = file.fullPath;
    const dynamic = path.includes(':');
    const namedRegex = path.replace(/:(\w+)/g, (_, key) => `:${key}`);
    const regex = new RegExp(
      `^${namedRegex.replace(/\//g, '\\/').replace(/:\w+/g, '([^\\/]+)')}$`,
    ).source;

    return {
      env,
      method,
      type: type || 'lazy',
      middleware: false,
      path,
      dynamic,
      filePath,
      regex,
    };
  });
}

type ScanDirOptions = {
  dir: string;
  name: string;
  ignore?: string[];
};

async function scanDir(options: ScanDirOptions): Promise<FileInfo[]> {
  const fileNames = await globby(join(options.name, GLOB_SCAN_PATTERN), {
    cwd: options.dir,
    dot: true,
    ignore: options.ignore,
    absolute: true,
  });

  return fileNames
    .map((fullPath) => {
      return {
        fullPath,
        path: relative(join(options.dir, options.name), fullPath),
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}
