import { cp, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { build } from 'tsup';

const subpaths = [
  'cli',
  'config',
  'core',
  'meta',
  'studio',
  'swagger',
  'types',
];

/**
 * Builds the Lithia package using tsup.
 */
async function buildLithia() {
  await build({
    name: 'lithia',
    entry: [
      ...subpaths.map((subpath) => `src/${subpath}/index.ts`),
      'src/index.ts',
    ],
    target: 'esnext',
    platform: 'node',
    bundle: true,
    external: [...subpaths.map((subpath) => `lithia/${subpath}`), 'esbuild'],
    dts: true,
    minify: false,
    treeshake: { preset: 'recommended' },
    format: ['cjs'],
    clean: true,
  });
}

/**
 * Processes all files in the `dist` directory to update import paths.
 */
async function processDistFiles() {
  const files = await readdir(join(process.cwd(), 'dist'), {
    withFileTypes: true,
    recursive: true,
  });

  for (const file of files) {
    if (!file.isFile()) continue;

    await updateImportPaths(join(file.parentPath, file.name));
  }
}

/**
 * Updates import paths in a file to resolve Lithia subpaths correctly.
 * @param {string} fullPath - The absolute path of the file to process.
 */
async function updateImportPaths(fullPath: string) {
  const content = await readFile(fullPath, 'utf-8');

  let updatedContent = '';

  if (fullPath.endsWith('.js')) {
    updatedContent = content.replace(
      /require\(['"](lithia(?:\/[a-zA-Z0-9_-]+)?)['"]\)/g,
      (items, lithiaPath) => {
        const pathMap: Record<string, string> = {
          'lithia/cli': './cli',
          'lithia/config': './config',
          'lithia/core': './core',
          'lithia/meta': './meta',
          'lithia/studio': './studio',
          'lithia/swagger': './swagger',
          'lithia/types': './types',
        };

        const resolvedPath = pathMap[lithiaPath];
        if (!resolvedPath) return items;

        let relativePath = relative(
          dirname(fullPath),
          join(process.cwd(), 'dist', resolvedPath, 'index.js'),
        ).replace(/\\/g, '/');

        if (relativePath[0] !== '.') {
          relativePath = `./${relativePath}`;
        }

        return `require("${relativePath}")`;
      },
    );
  } else {
    updatedContent = content.replace(
      /(import|export)\s*\{([a-zA-Z0-9_,\s$]*)\}\s*from\s*['"](lithia(?:\/[a-zA-Z0-9_-]+)?)['"]/g,
      (match, type, items, lithiaPath) => {
        const pathMap: Record<string, string> = {
          'lithia/cli': './cli',
          'lithia/config': './config',
          'lithia/core': './core',
          'lithia/meta': './meta',
          'lithia/studio': './studio',
          'lithia/swagger': './swagger',
          'lithia/types': './types',
        };

        const resolvedPath = pathMap[lithiaPath];
        if (!resolvedPath) return match;

        let relativePath = relative(
          dirname(fullPath),
          join(process.cwd(), 'dist', resolvedPath, 'index.js'),
        ).replace(/\\/g, '/');

        if (relativePath[0] !== '.') {
          relativePath = `./${relativePath}`;
        }

        return `${type} {${items}} from "${relativePath}"`;
      },
    );
  }
  await writeFile(fullPath, updatedContent);
}

/**
 * Copies the `certs` directory from `src/studio/certs` to `dist/studio/certs`.
 */
async function copyCertsDirectory() {
  await cp('src/studio/certs', 'dist/studio/certs', { recursive: true });
}

/**
 * Main function to orchestrate the build process.
 */
async function main() {
  try {
    await buildLithia();
    await processDistFiles();
    await copyCertsDirectory();
  } catch (error) {
    console.error('Build process failed:', error);
    process.exit(1);
  }
}

// Execute the build process
main();
