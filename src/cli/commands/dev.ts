import { defineCommand } from 'citty';
import { DevServerManager, DevServerOptions } from './dev/index';

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Start the development server',
  },
  args: {
    port: {
      type: 'string',
      description: 'Port to run the server on',
      default: '3000',
    },
    host: {
      type: 'string',
      description: 'Host to bind the server to',
      default: '0.0.0.0',
    },
    verbose: {
      type: 'boolean',
      description: 'Enable verbose output',
      default: false,
    },
    watch: {
      type: 'boolean',
      description: 'Enable file watching for auto-reload',
      default: true,
    },
    studio: {
      type: 'boolean',
      description: 'Start Lithia Studio for API testing',
      default: true,
    },
  },
  async run({ args }) {
    const devServerOptions: DevServerOptions = {
      server: {
        port: parseInt(args.port as string, 10),
        host: args.host as string,
      },
      autoReload: args.watch as boolean,
      verbose: args.verbose as boolean,
      studio: args.studio as boolean,
      maxReloadAttempts: 3,
      fileWatcher: {
        debounceDelay: 300,
        recursive: true,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/.lithia/**',
        ],
        ignoreInitial: true,
      },
    };

    const devServer = new DevServerManager(devServerOptions);

    // Setup process event handlers
    const handleShutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      try {
        await devServer.cleanup();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    const handleError = async (error: Error) => {
      console.error('Uncaught exception:', error);
      try {
        await devServer.cleanup();
      } catch (cleanupError) {
        console.error('Error during cleanup:', cleanupError);
      }
      process.exit(1);
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('uncaughtException', handleError);
    process.on('unhandledRejection', handleError);

    try {
      // Start the development server
      await devServer.start();

      // Keep the process running
      if (devServerOptions.verbose) {
        const lithia = devServer.lithiaInstance;
        lithia?.logger.info(
          'Development server is running. Press Ctrl+C to stop.',
        );
        lithia?.logger.info('Use --verbose flag for detailed logs');
      }
    } catch (error) {
      console.error('Failed to start development server:', error);
      await devServer.cleanup();
      process.exit(1);
    }
  },
});
