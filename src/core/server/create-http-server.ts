import consola from 'consola';
import { createServer, Server } from 'http';
import { Lithia, RouteModule } from 'lithia/types';
import { pathToFileURL } from 'node:url';
import { isAsyncFunction } from 'node:util/types';
import { _LithiaRequest } from './request';
import { _LithiaResponse } from './response';
import { getRoutesFromManifest } from './router';

export function createHttpServer(lithia: Lithia): Server {
  const server = createServer(async (httpReq, httpRes) => {
    const req = new _LithiaRequest(httpReq, lithia);
    const res = new _LithiaResponse(httpRes);

    const routes = getRoutesFromManifest(lithia).filter((route) => {
      const pass: boolean[] = [];

      pass.push(route.method ? route.method === req.method : true);
      pass.push(route.env ? route.env === lithia.options._env : true);
      pass.push(new RegExp(route.regex).test(req.pathname));

      return pass.every((p) => p === true);
    });

    if (routes.length === 0) {
      res.status(404).send('Not Found');
      return res.end();
    }

    if (routes.length > 1) {
      res
        .status(409)
        .send(
          'Multiple matching routes found, cannot determine which one to use.',
        );
      return res.end();
    }

    const route = routes[0];
    const module: RouteModule = await import(
      `${pathToFileURL(route.filePath).href}?updated=${Date.now()}`
    );

    if (!module.default || typeof module.default !== 'function') {
      res.status(500).send('Route module does not export a default function');
      return res.end();
    }

    if (!isAsyncFunction(module.default)) {
      res
        .status(500)
        .send('Route module default export is not an async function');
      return res.end();
    }

    if (route.dynamic) {
      const params: Record<string, string> = {};
      const matches = req.pathname.match(new RegExp(route.regex));
      const paramNames = route.path.match(/:([^/]+)/g) || [];

      paramNames.forEach((paramName, index) => {
        params[paramName.slice(1)] = matches![index + 1];
      });

      req.params = params;
    }

    try {
      await module.default(req, res);
    } catch (error) {
      if (error._isHttpError) {
        return res.status(error.status).json({
          status: error.status,
          message: error.message,
          data: error.data,
        });
      }

      res.status(500).json({
        status: 500,
        message: error.message,
        ...(lithia.options._env === 'dev' && {
          stack: error.stack,
        })
      });
    }
  });

  server.listen(lithia.options.server.port, lithia.options.server.host, () => {
    consola.ready(
      `Server listening on http://${lithia.options.server.host}:${lithia.options.server.port}`,
    );
  });

  return server;
}
