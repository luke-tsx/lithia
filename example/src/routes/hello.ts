import { LithiaRequest, LithiaResponse } from '../../../dist/types';
import { foo } from '../db/drizzle';

export default function handler(req: LithiaRequest, res: LithiaResponse) {
  res.json({
    message: foo(),
  })
}