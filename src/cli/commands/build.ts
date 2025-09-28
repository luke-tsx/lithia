import { rm } from 'node:fs/promises';
import path from 'node:path';
import { defineCommand } from 'citty';
import { buildLithia, createLithia, prepare } from 'lithia/core';

type BuildMode = 'no-bundle' | 'full-bundle';

interface BuildOptions {
  mode?: BuildMode;
  clean?: boolean;
  output?: string;
  verbose?: boolean;
}

export default defineCommand({
  meta: {
    name: 'build',
    description: 'Build Lithia project for production',
  },
  args: {
    mode: {
      type: 'string',
      description: 'Build mode (no-bundle | full-bundle)',
      default: 'no-bundle',
    },
    clean: {
      type: 'boolean',
      description: 'Clean output directory before building',
      default: true,
    },
    output: {
      type: 'string',
      description: 'Output directory',
      default: '.lithia',
    },
    verbose: {
      type: 'boolean',
      description: 'Enable verbose output',
      default: false,
    },
  },
  async run({ args }) {
    // Validate build mode
    const validModes: BuildMode[] = ['no-bundle', 'full-bundle'];
    if (!validModes.includes(args.mode as BuildMode)) {
      console.error(`Invalid build mode: ${args.mode}`);
      console.error(`Valid modes: ${validModes.join(', ')}`);
      process.exit(1);
    }

    const options: BuildOptions = {
      mode: args.mode as BuildMode,
      clean: args.clean,
      output: args.output,
      verbose: args.verbose,
    };

    const startTime = Date.now();

    try {
      // Create Lithia instance with build configuration
      const lithia = await createLithia({
        _env: 'prod',
        _cli: {
          command: 'build',
        },
        build: {
          mode: options.mode,
        },
        // outputDir is fixed to '.lithia' - ignoring user override
      });

      if (options.verbose) {
        lithia.logger.info(`Building with mode: ${options.mode}`);
        lithia.logger.info(`Output directory: .lithia (fixed)`);
      }

      // Clean output directory if requested
      if (options.clean) {
        const outputPath = path.join(process.cwd(), '.lithia');
        try {
          await rm(outputPath, { recursive: true, force: true });
          if (options.verbose) {
            lithia.logger.info(`Cleaned output directory: ${outputPath}`);
          }
        } catch (_error) {
          // Directory might not exist, which is fine
        }
      }

      // Prepare and build
      await prepare();
      const result = await buildLithia(lithia);

      const buildTime = Date.now() - startTime;

      if (result.success) {
        lithia.logger.success(`Build completed successfully in ${buildTime}ms`);
        lithia.logger.info(`Routes built: ${result.routesBuilt}`);

        if (options.verbose) {
          lithia.logger.info(`Build mode: ${options.mode}`);
          lithia.logger.info(`Output directory: .lithia (fixed)`);
        }
      } else {
        lithia.logger.error('Build failed');
        lithia.logger.error(`Errors: ${result.errors.length}`);
        result.errors.forEach((error) => {
          lithia.logger.error(`  - ${error.message}`);
        });
        process.exit(1);
      }
    } catch (error) {
      console.error('Build process failed:', error);
      process.exit(1);
    }
  },
});
