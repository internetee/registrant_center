import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        baseUrl: 'https://localhost:4000',
        video: false,
        chromeWebSecurity: false,
        requestTimeout: 30000,
        responseTimeout: 30000,
        defaultCommandTimeout: 10000,
        supportFile: 'cypress/support/index.js',
        viewportWidth: 1280,
        viewportHeight: 720,
        videoCompression: false,
        pageLoadTimeout: 5000,
        trashAssetsBeforeRuns: true,
    },
});
