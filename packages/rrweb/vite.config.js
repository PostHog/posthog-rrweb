import config from '../../vite.config.default';

// export default config('src/index.ts', 'rrweb', { outputDir: 'dist/main' });
export default config('src/index.ts', 'rrweb', {
    build: {
        rollupOptions: {
            output: {
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name?.endsWith('.map')) {
                        return '[name]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
});
