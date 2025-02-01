import { LithiaRequest, LithiaResponse } from '../../../dist/types';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  res.json({
    message: 'Hello World!!!!!!!!!!!',
  });
}
