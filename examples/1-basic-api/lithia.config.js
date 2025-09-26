import { useCors } from 'lithia';

/**@type {import('lithia').LithiaConfig'} */
export default {
  build: {
    mode: 'no-bundle',
  },
  studio: {
    enabled: true,
    port: 8473,
  },
  globalMiddlewares: [useCors()],
  hooks: {
    'request:before': [
      (req, res) => {
        const time = Date.now();
        req.set('timeStart', time);
      },
    ],
    'request:after': [
      (req, res) => {
        const time = req.get('timeStart');
        console.log(`request:after ${Date.now() - time}ms`);
      },
    ],
  },
};
