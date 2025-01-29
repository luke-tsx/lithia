import { readFile, writeFile } from 'fs/promises';
import { globby } from 'globby';
import { dirname, join, relative } from 'path';
import { build } from 'tsup';

const subpaths = ['cli', 'config', 'core', 'meta', 'types'];

await build({
  name: 'lithia',
  entry: [
    'src/cli/index.ts',
    'src/config/index.ts',
    'src/core/index.ts',
    'src/meta/index.ts',
    'src/types/index.ts',
  ],
  target: 'esnext',
  platform: 'node',
  bundle: true,
  external: [
    'lithia',
    ...subpaths.map((subpath) => `lithia/${subpath}`),
    'esbuild',
  ],
  dts: true,
  minify: false,
  treeshake: {
    preset: 'recommended',
  },
  format: ['esm'],
  cjsInterop: false,
  clean: true,
  async onSuccess() {
    for (const subpath of subpaths) {
      await writeFile(
        `./${subpath}.d.ts`,
        `export * from "./dist/${subpath}/index"`,
      );
    }
  },
});

await globby('.', {
  cwd: join(process.cwd(), 'dist'),
  absolute: true,
  dot: true,
}).then(async (paths) => {
  for await (const fullPath of paths) {
    const content = await readFile(fullPath, 'utf-8');

    await writeFile(
      fullPath,
      content.replace(
        /(import|export)\s*\{([a-zA-Z0-9_,\s$]*)\}\s*from\s*['"](lithia(?:\/[a-zA-Z0-9_-]+)?)['"]/g,
        (match, type, items, lithiaPath) => {
          const pathMap: Record<string, string> = {
            lithia: './core',
            'lithia/cli': './cli',
            'lithia/config': './config',
            'lithia/core': './core',
            'lithia/meta': './meta',
            'lithia/types': './types',
          };

          const resolvedPath = pathMap[lithiaPath];
          if (!resolvedPath) return match;

          let relativePath = relative(
            dirname(fullPath),
            join(process.cwd(), 'dist', resolvedPath, 'index.js'),
          );

          if (relativePath[0] !== '.') {
            relativePath = `./${relativePath}`;
          }

          return `${type} {${items}} from "${relativePath}"`;
        },
      ),
    );
  }
});
