import {
  Lithia,
  LithiaRequest,
  LithiaResponse,
  OpenApiSpec,
} from 'lithia/types';
import { readFile } from 'node:fs/promises';
import dist from 'swagger-ui-dist';
import { withBase } from 'ufo';
import { buildSwaggerConfig } from './build-swagger-config';
import { buildSwaggerUI } from './build-swagger-ui';
import { buildSwaggerInitializerScript } from './buils-swagger-initializer-script';

export const useSwagger = (
  swaggerOptions: Pick<OpenApiSpec, 'openapi' | 'info'> & {
    path: string;
    security?: OpenApiSpec['security'];
  },
) => {
  const swaggerDistPath = dist.getAbsoluteFSPath();
  const baseUrl = withBase(swaggerOptions.path, '/');

  return async (req: LithiaRequest, res: LithiaResponse, next: () => void) => {
    const lithia = req.get<Lithia>('lithia');
    if (!lithia) return next();

    if (req.pathname.startsWith(baseUrl)) {
      const requestPath = req.pathname.replace(baseUrl, '/').replace('//', '/');

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
        const initializer = buildSwaggerInitializerScript({
          spec,
        });

        res.addHeader('Content-Type', 'application/javascript');
        return res.send(initializer);
      }

      if (requestPath === '/swagger-ui.css') {
        const css = await readFile(`${swaggerDistPath}/swagger-ui.css`);
        res.addHeader('Content-Type', 'text/css');
        return res.send(css);
      }

      if (requestPath === '/index.css') {
        const css = await readFile(`${swaggerDistPath}/index.css`);
        res.addHeader('Content-Type', 'text/css');
        return res.send(css);
      }

      if (requestPath === '/favicon-32x32.png') {
        const png = await readFile(`${swaggerDistPath}/favicon-32x32.png`);
        res.addHeader('Content-Type', 'image/png');
        return res.send(png);
      }

      if (requestPath === '/favicon-16x16.png') {
        const png = await readFile(`${swaggerDistPath}/favicon-16x16.png`);
        res.addHeader('Content-Type', 'image/png');
        return res.send(png);
      }

      if (requestPath === '/swagger-ui-bundle.js') {
        const js = await readFile(`${swaggerDistPath}/swagger-ui-bundle.js`);
        res.addHeader('Content-Type', 'application/javascript');
        return res.send(js);
      }

      if (requestPath === '/swagger-ui-standalone-preset.js') {
        const js = await readFile(
          `${swaggerDistPath}/swagger-ui-standalone-preset.js`,
        );
        res.addHeader('Content-Type', 'application/javascript');
        return res.send(js);
      }
    }

    next();
  };
};
