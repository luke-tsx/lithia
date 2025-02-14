import { LithiaMiddleware, UnauthorizedError } from 'lithia';

export function auth(): LithiaMiddleware {
  return async function auth(req, res, next) {
    const token = req.headers.authorization;

    if (!token) {
      throw new UnauthorizedError('No token provided');
    }

    console.log('Token:', token);

    // try {
    //   const decoded = jwt.verify(tokenValue, process.env.JWT_SECRET);
    //   req.set('user', decoded);
    //   next();
    // } catch {
    //   throw new UnauthorizedError('Invalid token');
    // }

    return next();
  };
}
