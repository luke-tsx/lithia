import { BadRequestError, LithiaRequest, LithiaResponse } from 'lithia';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  // res.json({
  //   message: 'Hello, from Lithia! 🚀🚀🚀🚀',
  // });

  throw new BadRequestError('Validation failed', { issues: 'test' });
}
