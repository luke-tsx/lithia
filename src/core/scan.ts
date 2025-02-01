import { globby } from 'globby';
import {
  FileInfo,
  Lithia,
  MatchedEnvSuffix,
  MatchedMethodSuffix,
  Route,
} from 'lithia/types';
import nodePath from 'node:path';
import { withBase, withLeadingSlash, withoutTrailingSlash } from 'ufo';

const suffixRegex =
  /(\.(?<method>connect|delete|get|head|options|patch|post|put|trace))?(\.(?<env>dev|prod))?$/;

export async function scanServerRoutes(lithia: Lithia): Promise<Route[]> {
  const files = await scanDir({
    dir: process.cwd(),
    name: nodePath.resolve(
      process.cwd(),
      lithia.options.srcDir,
      lithia.options.routesDir,
    ),
    ignore: ['**/*.{spec,test}.ts'],
  });

  return files.map((file) => {
    let path = file.path
      .replace(/\.[A-Za-z]+$/, '')
      .replace(/\(([^(/\\]+)\)[/\\]/g, '')
      .replace(/\[\.{3}]/g, '**')
      .replace(/\[\.{3}(\w+)]/g, '**:$1')
      .replace(/\[([^/\]]+)]/g, ':$1')
      .replace(/\\/g, '/');

    path = withLeadingSlash(
      withoutTrailingSlash(withBase(path, lithia.options.router.globalPrefix)),
    );
    const suffixMatch = path.match(suffixRegex);
    let method: MatchedMethodSuffix | undefined;
    let env: MatchedEnvSuffix | undefined;

    if (suffixMatch?.index && suffixMatch?.index >= 0) {
      path = path.slice(0, suffixMatch.index);
      method = suffixMatch.groups?.method?.toUpperCase() as
        | MatchedMethodSuffix
        | undefined;
      env = suffixMatch.groups?.env as MatchedEnvSuffix | undefined;
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
  const normalizedName = options.name.replace(/\\/g, '/');
  const pattern = `${normalizedName}/**/*.ts`;

  const fileNames = await globby(pattern, {
    cwd: options.dir,
    dot: true,
    ignore: options.ignore,
    absolute: true,
  });

  return fileNames
    .map((fullPath) => {
      const path = nodePath.relative(normalizedName, fullPath);

      return {
        fullPath,
        path,
      };
    })
    .sort((a, b) => a.path.localeCompare(b.path));
}
