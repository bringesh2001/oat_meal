const { execSync } = require('child_process');
const path = require('path');

console.log('Setting up the project...');

try {
    // Install backend dependencies
    console.log('\nInstalling backend dependencies...');
    execSync('pip install -r backend/requirements.txt', { stdio: 'inherit' });

    // Install frontend dependencies
    console.log('\nInstalling frontend dependencies...');
    execSync('cd my-app && npm install', { stdio: 'inherit' });

    // Install root dependencies
    console.log('\nInstalling root dependencies...');
    execSync('npm install', { stdio: 'inherit' });

    console.log('\nSetup completed successfully!');
} catch (error) {
    console.error('\nSetup failed:', error);
    process.exit(1);
}
