import { LithiaRequest, LithiaResponse } from '../../../dist';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  res.json({
    messdage: 'Hello, from Lithia! 🚀🚀🚀🚀',
  });
}
