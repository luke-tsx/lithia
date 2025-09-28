import type { LithiaRequest, LithiaResponse } from 'lithia';

export default async function handler(_req: LithiaRequest, res: LithiaResponse) {
  console.log('Hello, from Lithia! 🚀');
  res.send('Hello, from Lithia! 🚀');
}
