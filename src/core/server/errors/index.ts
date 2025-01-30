export class HttpError extends Error {
  public readonly _isHttpError = true;
  public status: number;
  public message: string;
  public data: unknown;

  constructor(status: number, message: string, data: unknown) {
    super(message);
    this.status = status;
    this.message = message;
    this.data = data;
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Bad Request';
      dt = messageOrData;
    }

    super(400, msg, dt);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Unauthorized';
      dt = messageOrData;
    }

    super(401, msg, dt);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Forbidden';
      dt = messageOrData;
    }

    super(403, msg, dt);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Not Found';
      dt = messageOrData;
    }

    super(404, msg, dt);
  }
}

export class MethodNotAllowedError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Method Not Allowed';
      dt = messageOrData;
    }

    super(405, msg, dt);
  }
}

export class RequestTimeoutError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Request Timeout';
      dt = messageOrData;
    }

    super(408, msg, dt);
  }
}

export class ConflictError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Conflict';
      dt = messageOrData;
    }

    super(409, msg, dt);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Internal Server Error';
      dt = messageOrData;
    }

    super(500, msg, dt);
  }
}

export class NotImplementedError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Not Implemented';
      dt = messageOrData;
    }

    super(501, msg, dt);
  }
}

export class ServiceUnavailableError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Service Unavailable';
      dt = messageOrData;
    }

    super(503, msg, dt);
  }
}

export class GatewayTimeoutError extends HttpError {
  constructor(message: string, data?: unknown);
  constructor(data: unknown);
  constructor(messageOrData: string | unknown, data?: unknown) {
    let msg: string;
    let dt: unknown;

    if (typeof messageOrData === 'string') {
      msg = messageOrData;
      dt = data;
    } else {
      msg = 'Gateway Timeout';
      dt = messageOrData;
    }

    super(504, msg, dt);
  }
}