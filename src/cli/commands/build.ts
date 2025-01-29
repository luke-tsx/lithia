import { defineCommand } from 'citty';
import { build, createLithia, prepare } from 'lithia';

export default defineCommand({
  meta: {
    name: 'build',
    description: 'Build Lithia project for production',
  },
  async run() {
    const lithia = await createLithia({
      _env: 'prod',
      _cli: {
        command: 'build',
      },
    });
    await prepare(lithia);
    await build(lithia);
  },
});
