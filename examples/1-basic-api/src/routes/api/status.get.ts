import type { LithiaRequest, LithiaResponse } from 'lithia';

export default async function handler(_req: LithiaRequest, res: LithiaResponse) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  });
}
