import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

async function build() {
    try {
        // Build client
        console.log('Building client...');
        const { stdout, stderr } = await execAsync('vite build', {
            stdio: ['inherit', 'pipe', 'pipe'], // Capture output while still showing it
        });

        if (stdout) console.log(stdout);
        if (stderr) console.error(stderr);

        console.log('Build completed successfully!');
    } catch (error) {
        console.error('Build failed:', error);
        if (error.stdout) console.log('stdout:', error.stdout);
        if (error.stderr) console.log('stderr:', error.stderr);
        process.exit(1);
    }
}

build();
