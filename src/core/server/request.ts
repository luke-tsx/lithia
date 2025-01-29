import { Lithia, LithiaRequest, Params, Query } from 'lithia/types';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { parse } from "node:url";

export class _LithiaRequest implements LithiaRequest {
  headers: Readonly<IncomingHttpHeaders>;
  method: Readonly<string>;
  params: Readonly<Params>;
  pathname: Readonly<string>;
  query: Readonly<Query>;
  private storage: Map<string, unknown>;

  constructor(
    private readonly req: IncomingMessage,
    private readonly lithia: Lithia,
  ) {
    const url = parse(req.url!, true);
    this.pathname = url.pathname!;
    this.method = req.method!;
    this.headers = req.headers;
    this.query = parseQuery(new URLSearchParams(url.search ?? ''), this.lithia);
    this.storage = new Map<string, unknown>();
    this.params = {};
  }

  async body<T>(): Promise<Readonly<T>> {
    if (!['POST', 'PUT', 'PATCH'].includes(this.method)) {
      return {} as T;
    }

    return new Promise((resolve, reject) => {
      let body = '';

      this.req.on('data', (chunk) => {
        body += chunk;
      });

      this.req.on('end', () => {
        if (body.length === 0) {
          resolve({} as T);
          return;
        }

        switch (this.headers['content-type']) {
          case 'application/json':
            try {
              resolve(JSON.parse(body));
            } catch (error) {
              reject(error);
            }
            break;
          default:
            return body as unknown as T;
        }
      });

      this.req.on('error', (error) => {
        reject(error);
      });
    });
  }

  get<T>(key: string): T | undefined {
    return this.storage.get(key) as T;
  }

  set(key: string, value: unknown): void {
    this.storage.set(key, value);
  }
}

export function parseQuery(url: URLSearchParams, lithia: Lithia) {
  const { number, boolean, array } = lithia.options.server.request.queryParser;
  const query: Query = {};

  for (const [key, value] of url.entries()) {
    if (number.enabled && !isNaN(Number(value))) {
      query[key] = Number(value);
      continue;
    }

    if (boolean.enabled && (value === 'true' || value === 'false')) {
      query[key] = value === 'true';
      continue;
    }

    if (array.enabled && array.delimiter) {
      query[key] = value.split(array.delimiter);
    }
  }

  return query;
}
