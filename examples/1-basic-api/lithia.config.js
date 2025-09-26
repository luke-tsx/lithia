import { useCors } from 'lithia';

export default {
  // Configuração do modo de build
  build: {
    mode: 'no-bundle', // 'no-bundle' | 'full-bundle'
    externalPackages: ['drizzle-orm', 'lodash', 'zod', 'esbuild'], // Para futuras extensões
  },

  // Configuração do Studio
  studio: {
    enabled: true,
    port: 8473,
    wsPort: 8474,
  },

  globalMiddlewares: [useCors()],
};
