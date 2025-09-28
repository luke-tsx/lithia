import { defineCommand } from 'citty';
import { DevServerManager } from './dev/index';

export default defineCommand({
  meta: {
    name: 'dev',
    description: 'Start the development server',
  },
  async run() {
    const devServer = new DevServerManager({
      autoReload: true,
      debug: false,
      maxReloadAttempts: 3,
    });

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
      if (devServer.isDebugEnabled) {
        const lithia = devServer.lithiaInstance;
        lithia?.logger.info('Development server is running. Press Ctrl+C to stop.');
        lithia?.logger.info('Use --debug flag for detailed logs');
      }
    } catch (error) {
      console.error('Failed to start development server:', error);
      await devServer.cleanup();
      process.exit(1);
    }
  },
});
