import consola from 'consola';
import { Lithia, RouteModule } from 'lithia/types';
import { createServer, Server } from 'node:http';
import { pathToFileURL } from 'node:url';
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
    const module: RouteModule = await import(`${pathToFileURL(route.filePath).href}?updated=${Date.now()}`);

    if (!module.default || typeof module.default !== 'function') {
      res.status(500).send('Route module does not export a default function');
      return res.end();
    }

    try {
      await module.default(req, res);
    } catch (error) {
      consola.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

  server.listen(lithia.options.server.port, lithia.options.server.host, () => {
    consola.ready(
      `Server listening on http://${lithia.options.server.host}:${lithia.options.server.port}`,
    );
  });

  return server;
}
