import type { LithiaRequest, LithiaResponse } from 'lithia';

export default async (_: LithiaRequest, res: LithiaResponse) => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  res.send('Hello, from Lithia! 🚀');
};
