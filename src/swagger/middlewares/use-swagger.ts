import {
  Lithia,
  LithiaRequest,
  LithiaResponse,
  OpenApiSpec,
} from 'lithia/types';
import { readFile } from 'node:fs/promises';
import dist from 'swagger-ui-dist';
import { withBase } from 'ufo';
import { buildSwaggerConfig } from '../build-swagger-config';
import { buildSwaggerUI } from '../build-swagger-ui';
import { buildSwaggerInitializerScript } from '../buils-swagger-initializer-script';

const STATIC_FILES: {
  [path: string]: { path: string; contentType: string };
} = {
  '/swagger-ui.css': { path: 'swagger-ui.css', contentType: 'text/css' },
  '/index.css': { path: 'index.css', contentType: 'text/css' },
  '/favicon-32x32.png': { path: 'favicon-32x32.png', contentType: 'image/png' },
  '/favicon-16x16.png': { path: 'favicon-16x16.png', contentType: 'image/png' },
  '/swagger-ui-bundle.js': {
    path: 'swagger-ui-bundle.js',
    contentType: 'application/javascript',
  },
  '/swagger-ui-standalone-preset.js': {
    path: 'swagger-ui-standalone-preset.js',
    contentType: 'application/javascript',
  },
};

export const useSwagger = (
  swaggerOptions: Pick<OpenApiSpec, 'openapi' | 'info'> & {
    path: string;
  },
) => {
  const swaggerDistPath = dist.getAbsoluteFSPath();
  const baseUrl = withBase(swaggerOptions.path, '/');

  return async (req: LithiaRequest, res: LithiaResponse, next: () => void) => {
    const lithia = req.get<Lithia>('lithia');
    if (!lithia) return next();

    const requestPath = req.pathname.replace(baseUrl, '/').replace('//', '/');
    if (!requestPath.startsWith('/')) return next();

    if (requestPath === '/') {
      const ui = buildSwaggerUI({
        title: `Swagger UI ${swaggerOptions.info.title ? `- ${swaggerOptions.info.title}` : ''}`,
        baseUrl,
      });
      res.addHeader('Content-Type', 'text/html');
      return res.send(ui);
    }

    if (requestPath === '/swagger-initializer.js') {
      const spec = await buildSwaggerConfig(lithia, swaggerOptions);
      const initializer = buildSwaggerInitializerScript({ spec });
      res.addHeader('Content-Type', 'application/javascript');
      return res.send(initializer);
    }

    const staticFile = STATIC_FILES[requestPath];
    if (staticFile) {
      try {
        const fileContent = await readFile(
          `${swaggerDistPath}/${staticFile.path}`,
        );
        res.addHeader('Content-Type', staticFile.contentType);
        return res.send(fileContent);
      } catch {
        return res.status(500).send('Could not load static file');
      }
    }

    next();
  };
};
