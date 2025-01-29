import { LithiaRequest, LithiaResponse } from "lithia/types";

export function defineRouteHandler(handler: (req: LithiaRequest, res: LithiaResponse) => Promise<void> | void) {
  return async function (req: LithiaRequest, res: LithiaResponse) {
    await handler(req, res);
  };
}