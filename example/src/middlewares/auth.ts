import { z } from 'zod';
import { BadRequestError, LithiaMiddleware } from '../../../dist';

export function validateRequestBody<T extends z.ZodRawShape>(
  schema: z.ZodObject<T>,
): LithiaMiddleware {
  return async (req, _, next) => {
    const body = await req.body<T>().then((body) => schema.safeParse(body));

    if (!body.success) {
      const issues = body.error.errors.map((error) => {
        return {
          field: error.path.join('.'),
          message:
            error.message === 'Required' ? 'Campo obrigatório' : error.message,
        };
      });

      throw new BadRequestError(issues);
    }

    console.log(body.data);

    next();
  };
}
