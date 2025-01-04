import { spawn } from 'node:child_process';

function build() {
    console.log('Building client...');
    
    const buildProcess = spawn('vite', ['build'], {
        stdio: 'inherit',
        shell: true
    });

    buildProcess.on('error', (error) => {
        console.error('Build failed:', error);
        process.exit(1);
    });

    buildProcess.on('close', (code) => {
        if (code === 0) {
            console.log('Build completed successfully!');
        } else {
            console.error(`Build process exited with code ${code}`);
            process.exit(1);
        }
    });
}

build();
