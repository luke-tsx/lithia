import { OutgoingHttpHeaders, ServerResponse } from 'http';
import { LithiaResponse } from 'lithia/types';

export class _LithiaResponse implements LithiaResponse {
  constructor(private res: ServerResponse) {}

  status(status: number): LithiaResponse {
    this.res.statusCode = status;
    return this;
  }

  headers(): Readonly<OutgoingHttpHeaders> {
    return this.res.getHeaders();
  }

  addHeader(name: string, value: string): LithiaResponse {
    this.res.setHeader(name, value);
    return this;
  }

  removeHeader(name: string): LithiaResponse {
    this.res.removeHeader(name);
    return this;
  }

  end(): void {
    this.res.end();
  }

  json(data: object): void {
    this.res.setHeader('Content-Type', 'application/json');
    this.res.write(JSON.stringify(data));
    this.res.end();
  }

  send(data: unknown): void {
    if (typeof data === 'object') {
      this.json(data as object);
      return;
    }

    this.res.write(data?.toString());
    this.res.end();
  }
}
