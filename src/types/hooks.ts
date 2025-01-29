type HookResult = void | Promise<void>;

export type LithiaHooks = {
  restart: () => HookResult;
  close: () => HookResult;
};
