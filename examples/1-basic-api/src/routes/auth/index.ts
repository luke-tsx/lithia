import { z } from 'zod';
import {
  LithiaMiddleware,
  LithiaRequest,
  LithiaResponse,
} from 'lithia';
import { validateRequestBody } from '../../middlewares/auth';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  res.json({
    message: 'Hello, from Lithia! 🚀',
  });
}

export const middlewares: LithiaMiddleware[] = [
  validateRequestBody(
    z.object({
      name: z.string(),
      code: z.string(),
    }),
  ),
];
