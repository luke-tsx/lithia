import { ConsolaInstance } from 'consola';
import { Hookable } from 'hookable';
import { LithiaOptions } from './config';
import { LithiaHooks } from './hooks';
import { LoadedRoute, Route } from './route';

export type Lithia = {
  options: LithiaOptions;
  hooks: Hookable<LithiaHooks>;
  logger: ConsolaInstance;
  loadedRoutes: LoadedRoute[];
  scannedRoutes: Route[];
};
