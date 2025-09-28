import { LithiaRequest, LithiaResponse } from 'lithia';

export default async function handler(req: LithiaRequest, res: LithiaResponse) {
  const { id, petId } = req.params;

  res.json({
    user: {
      id,
      name: `User ${id}`,
      petId,
      petName: `Pet ${petId}`,
      email: `user${id}@example.com`,
      createdAt: new Date().toISOString(),
    },
  });
}
