import { LithiaMiddleware, LithiaRequest, LithiaResponse } from '../../../dist';
import { auth } from '../middlewares/auth';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  res.json({
    message: 'Hello, from Lithia! 🚀',
  });
}

export const middlewares: LithiaMiddleware[] = [auth()];
