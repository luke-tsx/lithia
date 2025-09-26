export default {
  // Configuração do modo de build
  build: {
    mode: 'no-bundle', // 'no-bundle' | 'full-bundle'
    externalPackages: ['drizzle-orm', 'lodash', 'zod', 'esbuild'], // Para futuras extensões
    optimize: true,
  },
};
