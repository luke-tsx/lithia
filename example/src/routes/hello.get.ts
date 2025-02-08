import { LithiaRequest, LithiaResponse, Metadata } from '../../../dist';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  console.log(await req.body());

  res.json({
    message: 'Hello, from Lithia! 🚀',
  });
}

export const metadata: Metadata = {
  openAPI: {
    tags: ['Hello'],
    responses: {
      200: {
        description: 'Successful response',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  },
};
