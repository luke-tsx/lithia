import { LithiaRequest, LithiaResponse } from 'lithia';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.version,
  });
}
