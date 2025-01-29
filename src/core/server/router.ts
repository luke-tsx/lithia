import { Lithia } from 'lithia/types';

export function findMatchingRoute(
  lithia: Lithia,
  pathname: string,
  method: string,
) {
  const possibleRoutes = lithia.scannedRoutes.filter((route) => {
    const pass: boolean[] = [];

    pass.push(route.regex.test(pathname));

    if (route.method) {
      pass.push(route.method === method);
    }

    if (route.env) {
      pass.push(route.env === lithia.options._env);
    }

    return pass.every((p) => p);
  });

  return possibleRoutes;
}
