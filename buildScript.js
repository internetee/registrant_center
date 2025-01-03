import fs from 'node:fs';
import fse from 'fs-extra';
import { exec } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function build() {
    // Clean up existing directories
    const clientDist = path.join(__dirname, 'dist');
    const serverDist = path.join(__dirname, 'server', 'dist');

    if (fs.existsSync(clientDist)) {
        console.log('Cleaning client dist directory...');
        fse.removeSync(clientDist);
    }

    if (fs.existsSync(serverDist)) {
        console.log('Cleaning server dist directory...');
        fse.removeSync(serverDist);
    }

    try {
        // Build client
        console.log('Building client...');
        const buildCommand = process.env.CI ? 'CI=true vite build' : 'vite build';
        await execAsync(buildCommand, { stdio: 'inherit' });

        // Ensure client dist was created
        if (!fs.existsSync(clientDist)) {
            throw new Error('Client build failed - dist directory not created');
        }

        // Create server dist directory
        console.log('Creating server dist directory...');
        fse.ensureDirSync(serverDist);

        // Copy client build to server
        console.log('Copying client build to server...');
        fse.copySync(clientDist, serverDist);

        console.log('Build completed successfully!');
        console.log(`Client build: ${clientDist}`);
        console.log(`Server build: ${serverDist}`);
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
