import { defineLithiaConfig, useSwagger } from '../dist';

export default defineLithiaConfig({
  globalMiddlewares: [
    useSwagger({
      path: '/docs',
      info: {
        title: 'Lithia.js API',
        version: '1.0.0',
      },
      security: [{}],
    }),
  ],
});
