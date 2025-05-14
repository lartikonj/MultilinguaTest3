#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Define the path to the Multilingua project
const projectPath = path.join(process.cwd(), 'multilingua_app', 'Multilingua-lartikonj-patch-1');

console.log('=== Running Multilingua Development Server ===');

// Check if project exists
if (!fs.existsSync(projectPath)) {
  console.error(`Error: Project directory not found at ${projectPath}`);
  process.exit(1);
}

// Change directory to the project
process.chdir(projectPath);
console.log(`Changed to directory: ${projectPath}`);

// Check if node_modules exists, if not, install dependencies
if (!fs.existsSync(path.join(projectPath, 'node_modules'))) {
  console.log('Installing dependencies...');
  
  const install = spawn('npm', ['install'], { stdio: 'inherit' });
  
  install.on('close', (code) => {
    if (code !== 0) {
      console.error(`Error: npm install exited with code ${code}`);
      process.exit(1);
    }
    
    startDevServer();
  });
} else {
  startDevServer();
}

function startDevServer() {
  console.log('Starting development server...');
  
  // Run the development server
  const devServer = spawn('npm', ['run', 'dev'], { 
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
  });
  
  devServer.on('close', (code) => {
    console.log(`Development server exited with code ${code}`);
    process.exit(code);
  });
  
  // Handle process termination signals
  process.on('SIGINT', () => {
    console.log('Received SIGINT signal. Shutting down...');
    devServer.kill('SIGINT');
  });
  
  process.on('SIGTERM', () => {
    console.log('Received SIGTERM signal. Shutting down...');
    devServer.kill('SIGTERM');
  });
}