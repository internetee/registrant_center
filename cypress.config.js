import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'http://localhost:4000',
        supportFile: 'cypress/support/index.js',
        viewportWidth: 1280,
        viewportHeight: 720,
        videoCompression: false,
        pageLoadTimeout: 5000,
        trashAssetsBeforeRuns: true,
    },
});
