import { IncomingHttpHeaders, OutgoingHttpHeaders } from 'http';
import { Params, Query } from './route';

export interface LithiaRequest {
  pathname: Readonly<string>;
  method: Readonly<string>;
  headers: Readonly<IncomingHttpHeaders>;
  query: Readonly<Query>;
  params: Readonly<Params>;
  body: <T>() => Promise<Readonly<T>>;
  get: <T>(key: string) => T | undefined;
  set: (key: string, value: unknown) => void;
  on: (
    event: 'data' | 'end' | 'error',
    listener: (chunk: unknown) => void,
  ) => void;
}

export interface LithiaResponse {
  status: (status: number) => LithiaResponse;
  headers: () => Readonly<OutgoingHttpHeaders>;
  addHeader: (name: string, value: string) => LithiaResponse;
  removeHeader: (name: string) => LithiaResponse;
  send: (data?: unknown) => void;
  end: () => void;
  json: (data: object) => void;
}

export type LithiaHandler = (
  req: LithiaRequest,
  res: LithiaResponse,
) => Promise<void>;

export type LithiaMiddleware = (
  req: LithiaRequest,
  res: LithiaResponse,
  next: () => void,
) => Promise<void>;

export type RouteModule = {
  default: LithiaHandler;
  middlewares?: LithiaMiddleware[];
  metadata?: unknown;
};
