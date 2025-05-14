#!/bin/bash

echo "=== Setting up and Running Multilingua Web Application ==="

# Change to the project directory
cd multilingua_app/Multilingua-lartikonj-patch-1

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building the project..."
npm run build

# Start the application
echo "Starting the application..."
npm run dev