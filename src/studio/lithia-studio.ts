import { Server, createServer } from 'http';
import { RouterManager } from 'lithia/core';
import type { Lithia, Route } from 'lithia/types';
import path from 'node:path';
import serveStatic from 'serve-static';
import { Socket, Server as SocketIOServer } from 'socket.io';

/**
 * Lithia Studio WebSocket and static file server.
 */
export class LithiaStudio {
  private io: SocketIOServer;
  private httpServer: Server;
  private lithia: Lithia;
  private isRunning = false;

  constructor(lithia: Lithia) {
    this.lithia = lithia;

    // Create HTTP server for both static files and WebSocket
    this.httpServer = createServer();

    // Initialize Socket.IO with proper CORS
    this.io = new SocketIOServer(this.httpServer, {
      cors: {
        origin: `http://localhost:8473`,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        credentials: true,
      },
    });
  }

  /**
   * Start the Studio server.
   */
  async start(): Promise<void> {
    if (this.isRunning) return;

    this.setupEventHandlers();
    this.setupStaticFileServing();

    this.httpServer.listen(8473, () => {
      this.lithia.logger.ready(`Studio listening on http://localhost:8473`);
    });

    this.isRunning = true;
  }

  /**
   * Stop the Studio server.
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    this.httpServer.close();
    this.lithia.logger.info('Lithia Studio server stopped');
    this.isRunning = false;
  }

  /**
   * Emit Lithia configuration to all connected clients.
   */
  async emitLithiaConfig(): Promise<void> {
    this.io.emit('lithia-config', { config: this.lithia.options });
  }

  /**
   * Emit manifest update to all connected clients.
   * This is the primary event that sends the current route manifest.
   */
  emitManifestUpdate(): void {
    try {
      const routes = this.getCurrentRoutes();
      this.io.emit('update-manifest', { routes });
      this.lithia.logger.debug(
        `Emitted manifest update with ${routes.length} routes`,
      );
    } catch (error) {
      this.lithia.logger.error('Error emitting manifest update:', error);
      this.io.emit('manifest-error', { error: (error as Error).message });
    }
  }

  /**
   * Emit build status update.
   */
  emitBuildStatus(success: boolean, error?: string): void {
    this.io.emit('build-status', { success, error });
  }

  /**
   * Setup WebSocket event handlers.
   */
  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      this.lithia.logger.debug('Studio client connected');

      // Send current configuration
      socket.emit('lithia-config', { config: this.lithia.options });

      // Send current manifest to newly connected client
      socket.on('get-manifest', () => {
        this.sendCurrentRoutes(socket);
      });

      // Send Lithia configuration when requested
      socket.on('get-lithia-config', () => {
        socket.emit('lithia-config', { config: this.lithia.options });
      });

      socket.on('disconnect', () => {
        this.lithia.logger.debug('Studio client disconnected');
      });
    });
  }

  /**
   * Setup static file serving for the Studio UI.
   */
  private setupStaticFileServing(): void {
    // Serve the built Studio files from dist/studio/app/
    const studioPath = path.join(__dirname, 'app', 'public');
    const staticServer = serveStatic(studioPath);

    this.httpServer.on('request', (req, res) => {
      // Skip WebSocket upgrade requests
      if (req.headers.upgrade === 'websocket') {
        return;
      }

      // Serve static files
      staticServer(req, res, () => {
        // Fallback to index.html for SPA routing
        req.url = '/index.html';
        staticServer(req, res, () => {
          // Final fallback - return 404
          res.statusCode = 404;
          res.end('Studio UI not found');
        });
      });
    });
  }

  /**
   * Get current routes from the manifest.
   */
  private getCurrentRoutes(): Route[] {
    const routerManager = new RouterManager(this.lithia);
    return routerManager.getRoutesFromManifest();
  }

  /**
   * Send current routes to a specific socket.
   */
  private sendCurrentRoutes(socket: Socket): void {
    try {
      const routes = this.getCurrentRoutes();
      socket.emit('update-manifest', { routes });
    } catch (error) {
      this.lithia.logger.error('Error sending routes to studio client:', error);
      socket.emit('manifest-error', { error: (error as Error).message });
    }
  }
}
