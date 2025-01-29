import { createServer, Server } from 'node:http';
import { Lithia } from 'lithia/types';
import { _LithiaResponse } from './response';
import { _LithiaRequest } from './request';
import consola from 'consola';
import { findMatchingRoute } from './router';

export function createHttpServer(lithia: Lithia): Server {
  const server = createServer(async (httpReq, httpRes) => {
    const req = new _LithiaRequest(httpReq, lithia);
    const res = new _LithiaResponse(httpRes);
    const route = findMatchingRoute(lithia, req.pathname, req.method);
  });

  server.listen(lithia.options.server.port, lithia.options.server.host, () => {
    consola.ready(
      `Server listening on http://${lithia.options.server.host}:${lithia.options.server.port}`,
    );
  });

  return server;
}
