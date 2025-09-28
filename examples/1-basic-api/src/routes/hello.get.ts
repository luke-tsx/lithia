import { LithiaRequest, LithiaResponse } from 'lithia';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  console.log('Hello, from Lithia! 🚀');
  res.send('Hello, from Lithia! 🚀');
}
