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
                configure: (proxy, _options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('proxy error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Sending Request to the Target:', req.method, req.url);
                    });
                },
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
        // Basic build options
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: true,
        target: 'es2015',
        
        // Use esbuild instead of terser
        minify: 'esbuild',
        
        // Disable browser features
        manifest: false,
        cssCodeSplit: true,
        modulePreload: false,
        
        // Performance optimizations
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    redux: ['@reduxjs/toolkit', 'react-redux'],
                },
                compact: true
            }
        },
        
        // CommonJS handling
        commonjsOptions: {
            transformMixedEsModules: true,
            include: [/node_modules/],
        },
        
        // Write manifest file
        write: true,
        
        // Disable browser-specific optimizations
        ssrManifest: false,
        emptyOutDir: true,
        brotliSize: false,
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
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
        },
        setupFiles: './setupTest.js',
    },
});
