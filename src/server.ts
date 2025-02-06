import { createHttpServer, createLithia } from 'lithia/core';

async function start() {
  const lithia = await createLithia({
    _env: 'prod',
  });

  createHttpServer(lithia);
}

start();
