import { LithiaRequest, LithiaResponse } from 'lithia/types';

type CorsOptions = {
  origin: string[];
  methods: string[];
  allowedHeaders: string[];
  exposedHeaders: string[];
  credentials: boolean;
  maxAge: number;
  preflightContinue: boolean;
  optionsSuccessStatus: number;
};

export const useCors = (options: Partial<CorsOptions>) => {
  const defaultOptions: CorsOptions = {
    origin: ['*'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: [],
    credentials: false,
    maxAge: 86400,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  }

  const opts = { ...defaultOptions, ...options };

  return async (req: LithiaRequest, res: LithiaResponse, next: () => void) => {
    const origin = req.headers.origin || '';
    const isPreflight = req.method === 'OPTIONS' && !req.headers['access-control-request-method'];
  
    if (isPreflight) {
      res.addHeader('Access-Control-Allow-Origin', opts.origin.includes(origin) ? origin : '');
      res.addHeader('Access-Control-Allow-Methods', opts.methods.join(','));
      res.addHeader('Access-Control-Allow-Headers', opts.allowedHeaders.join(','));
      res.addHeader('Access-Control-Max-Age', String(opts.maxAge));
      res.addHeader('Access-Control-Allow-Credentials', String(opts.credentials));
      res.addHeader('Access-Control-Expose-Headers', opts.exposedHeaders.join(','));
      res.statusCode = opts.optionsSuccessStatus;
      res.end();
      return;
    }



    next();
  };
};
