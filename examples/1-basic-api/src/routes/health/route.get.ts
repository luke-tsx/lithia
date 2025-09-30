import { validateRequestBody } from '@/middlewares/auth';
import type { LithiaRequest, LithiaResponse } from 'lithia';
import z from 'zod';

export default async (_: LithiaRequest, res: LithiaResponse) => {
  res.json({
    status: 'ok',
  });
};

export const middlewares = [validateRequestBody(z.object({}))];
