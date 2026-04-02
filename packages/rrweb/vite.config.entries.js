import config from '../../vite.config.default';
import { defineConfig, mergeConfig } from 'vite';

const baseConfig = config(
  {
    'rrweb-record': 'src/entries/record.ts',
    'rrweb-replay': 'src/entries/replay.ts',
  },
  'rrweb',
  { outputDir: 'dist' },
);

export default defineConfig((configEnv) =>
  mergeConfig(baseConfig(configEnv), {
    build: {
      rollupOptions: {
        external: [/@posthog\//],
      },
    },
  }),
);
