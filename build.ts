import { spawn } from 'node:child_process';
import { cp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { build } from 'tsup';

/**
 * Build pipeline steps for better organization and logging.
 */
enum BuildStep {
  INSTALL_STUDIO_DEPS = '📦 Install Studio Dependencies',
  BUILD_LITHIA_CORE = '⚙️ Build Lithia Core',
  PROCESS_DIST_FILES = '🔄 Process Distribution Files',
  BUILD_STUDIO_UI = '🎨 Build Studio UI',
  COPY_STUDIO_DIST = '📁 Copy Studio Dist Files',
  FINALIZE = '✨ Finalize Build',
}

const subpaths = ['cli', 'config', 'core', 'meta', 'studio', 'types'];

/**
 * Logs a build step start.
 */
function logStepStart(step: BuildStep): void {
  console.log(`\n🚀 ${step}...`);
}

/**
 * Logs a build step completion.
 */
function logStepComplete(step: BuildStep): void {
  console.log(`✅ ${step} completed`);
}

/**
 * Logs a build step error.
 */
function logStepError(step: BuildStep, error: string): void {
  console.error(`❌ ${step} failed: ${error}`);
}

/**
 * Executes a build step with proper logging and error handling.
 */
async function executeStep<T>(
  step: BuildStep,
  stepFunction: () => Promise<T>,
): Promise<T> {
  logStepStart(step);
  try {
    const result = await stepFunction();
    logStepComplete(step);
    return result;
  } catch (error) {
    logStepError(step, error instanceof Error ? error.message : String(error));
    throw error;
  }
}

/**
 * Installs Studio dependencies.
 */
async function installStudioDependencies(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const installProcess = spawn('pnpm', ['install'], {
      cwd: join(process.cwd(), 'studio'),
      stdio: 'inherit',
      shell: true,
    });

    installProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(
          new Error(`Studio dependency installation failed with code ${code}`),
        );
      }
    });

    installProcess.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Builds the Studio UI using Vite.
 */
async function buildStudio(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const buildProcess = spawn('pnpm', ['run', 'build'], {
      cwd: join(process.cwd(), 'studio'),
      stdio: 'inherit',
      shell: true,
    });

    buildProcess.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Studio build failed with code ${code}`));
      }
    });

    buildProcess.on('error', (error) => {
      reject(error);
    });
  });
}

/**
 * Copies the Studio dist files to the dist directory.
 */
async function copyStudioDist() {
  await rm(join(process.cwd(), 'dist', 'studio', 'app'), {
    recursive: true,
    force: true,
  });

  await cp(
    join(process.cwd(), 'studio', 'out'),
    join(process.cwd(), 'dist', 'studio', 'app'),
    {
      recursive: true,
    },
  );
}

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
 * Main function to orchestrate the build process.
 */
async function main() {
  const startTime = Date.now();

  try {
    console.log('🚀 Starting Lithia Build Pipeline...');
    console.log('═'.repeat(50));

    // Step 1: Install Studio dependencies
    await executeStep(BuildStep.INSTALL_STUDIO_DEPS, installStudioDependencies);

    // Step 2: Build Lithia core
    await executeStep(BuildStep.BUILD_LITHIA_CORE, buildLithia);

    // Step 3: Process distribution files
    await executeStep(BuildStep.PROCESS_DIST_FILES, processDistFiles);

    // Step 4: Build Studio UI (after Lithia is ready)
    await executeStep(BuildStep.BUILD_STUDIO_UI, buildStudio);

    // Step 5: Copy Studio dist files
    await executeStep(BuildStep.COPY_STUDIO_DIST, copyStudioDist);

    // Step 5: Finalize build
    await executeStep(BuildStep.FINALIZE, async () => {
      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`\n🎉 Build completed successfully in ${duration}s!`);
      console.log('═'.repeat(50));
    });
  } catch (error) {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.error(`\n💥 Build pipeline failed after ${duration}s`);
    console.error('═'.repeat(50));
    console.error(
      '❌ Error:',
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Execute the build process
main();
