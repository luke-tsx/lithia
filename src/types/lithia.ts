import { Hookable } from 'hookable';
import { LithiaOptions } from './config';
import { LithiaHooks } from './hooks';
import { Logger } from '../core/log';

export type Lithia = {
  options: LithiaOptions;
  hooks: Hookable<LithiaHooks>;
  logger: Logger;
};
