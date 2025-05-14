#!/bin/bash

# Script to run the Multilingua application in development mode
echo "=== Starting Multilingua Development Server ==="

# Change to the application directory
cd multilingua_app/Multilingua-lartikonj-patch-1

# Run the development server
NODE_ENV=development npx tsx server/index.ts