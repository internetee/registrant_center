import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function build() {
    try {
        // Build client
        console.log('Building client...');
        await execAsync('vite build', { stdio: 'inherit' });
        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();
