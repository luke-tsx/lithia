import consola from 'consola';
import { Lithia } from 'lithia/types';
import { createServer, Server } from 'node:http';
import { _LithiaRequest } from './request';
import { _LithiaResponse } from './response';
import { loadHandlers } from './router';

export function createHttpServer(lithia: Lithia): Server {
  loadHandlers(lithia);

  const server = createServer(async (httpReq, httpRes) => {
    const req = new _LithiaRequest(httpReq, lithia);
    const res = new _LithiaResponse(httpRes);
    res.end();
  });

  server.listen(lithia.options.server.port, lithia.options.server.host, () => {
    consola.ready(
      `Server listening on http://${lithia.options.server.host}:${lithia.options.server.port}`,
    );
  });

  return server;
}
