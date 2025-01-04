import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const env = loadEnv('', process.cwd(), '');

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: parseInt(env.PORT),
        proxy: {
            '/api': {
                target: `https://localhost:${env.VITE_SERVER_PORT || 1234}`,
                changeOrigin: true,
                secure: false,
            },
        },
    },
    esbuild: {
        target: ['es2020', 'chrome60', 'firefox60', 'safari11'],
        jsxFactory: 'React.createElement',
        jsxFragment: 'React.Fragment',
        loader: 'jsx',
    },
    optimizeDeps: {
        include: ['core-js', 'regenerator-runtime', 'react-cookie', 'universal-cookie'],
    },
    build: {
        commonjsOptions: {
            // include: [/core-js/, /regenerator-runtime/],
            transformMixedEsModules: true,
        },
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        target: 'es2015',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    'vendor-react': ['react', 'react-dom', 'react-router-dom'],
                    'vendor-redux': ['@reduxjs/toolkit', 'react-redux', 'redux', 'redux-state-sync'],
                    'vendor-ui': ['semantic-ui-react', 'react-helmet-async', 'react-layout-masonry'],
                    'vendor-utils': ['axios', 'core-js', 'regenerator-runtime']
                }
            }
        }
    },
    publicDir: 'public',
    assetsInclude: ['**/*.woff', '**/*.woff2'],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            '@fonts': '/fonts',
        },
        dedupe: ['react', 'react-dom'],
    },
    test: {
        global: true,
        environment: 'jsdom',
        coverage: {
            provider: 'v8', // or 'istanbul'
            reporter: ['text', 'json', 'html'],
        },
        setupFiles: './setupTest.js',
    },
});
