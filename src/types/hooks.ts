import { _LithiaRequest } from '../core/server/request';
import { _LithiaResponse } from '../core/server/response';
import { MiddlewareInfo } from './middleware';

type HookResult = void | Promise<void>;

/**
 * Simplified hooks system for Lithia framework.
 * Focuses on request and middleware lifecycle events.
 */
export type LithiaHooks = {
  // Request lifecycle hooks
  'request:before': (req: _LithiaRequest, res: _LithiaResponse) => HookResult;
  'request:after': (req: _LithiaRequest, res: _LithiaResponse) => HookResult;
  'request:error': (
    req: _LithiaRequest,
    res: _LithiaResponse,
    error: Error,
  ) => HookResult;

  // Middleware lifecycle hooks
  'middleware:beforeExecute': (
    middleware: MiddlewareInfo,
    req: _LithiaRequest,
    res: _LithiaResponse,
  ) => HookResult;
  'middleware:afterExecute': (
    middleware: MiddlewareInfo,
    req: _LithiaRequest,
    res: _LithiaResponse,
  ) => HookResult;
  'middleware:error': (
    middleware: MiddlewareInfo,
    req: _LithiaRequest,
    res: _LithiaResponse,
    error: Error,
  ) => HookResult;
};
