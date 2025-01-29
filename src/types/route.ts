import { LithiaHandler } from './handler';

export type MatchedMethodSuffix =
  | 'connect'
  | 'delete'
  | 'get'
  | 'head'
  | 'options'
  | 'patch'
  | 'post'
  | 'put'
  | 'trace';

export type MatchedEnvSuffix = 'dev' | 'prod';
export type MatchedTypeSuffix = 'lazy' | 'prerender';

export type Route = {
  method?: MatchedMethodSuffix;
  env?: MatchedEnvSuffix;
  type: MatchedTypeSuffix;
  middleware: boolean;
  path: string;
  dynamic: boolean;
  filePath: string;
  regex: string;
};

export type Query = {
  [key: string]: string | string[] | number | number[] | boolean;
};

export type Params = {
  [key: string]: string;
};

export type LoadedRoute = {
  regex: RegExp;
  dynamic: boolean;
  env?: MatchedEnvSuffix;
  method?: MatchedMethodSuffix;
  handler: LithiaHandler;
};